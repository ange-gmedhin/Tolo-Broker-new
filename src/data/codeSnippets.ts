export const PYTHON_FULL_CODE = `"""
Tolo Broker - Telegram Classifieds Bot for Phones
Library: python-telegram-bot (v20+ with async/await)
Features:
- ConversationHandler for multi-step listing creation
- Image upload handling (saves highest-res photo to disk & stores Telegram file_id)
- SQLite database persistence
- Buyer browsing with photo cards & direct phone dial link
"""

import os
import logging
import sqlite3
from pathlib import Path
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Conversation States
MODEL, DESCRIPTION, PRICE, PHOTO, PHONE = range(5)

# Directory to save downloaded phone images
UPLOAD_DIR = Path("uploads/phones")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = "tolo_broker.db"


def init_db():
    """Initialize SQLite database for phone listings."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            seller_name TEXT,
            seller_phone TEXT NOT NULL,
            phone_model TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            photo_file_id TEXT NOT NULL,
            photo_local_path TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


# ------------------ START & HELP ------------------

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Entry command for Tolo Broker."""
    welcome_text = (
        "👋 *Welcome to Tolo Broker!*\n\n"
        "Your trusted marketplace to buy & sell phones directly on Telegram.\n\n"
        "What would you like to do?\n"
        "➕ /newlisting - Post your phone for sale\n"
        "📱 /browse - Browse available phone listings\n"
        "❌ /cancel - Cancel any active operation"
    )
    await update.message.reply_text(welcome_text, parse_mode="Markdown")


# ------------------ SELLER FLOW (ConversationHandler) ------------------

async def new_listing(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Start the listing creation wizard."""
    context.user_data.clear()
    await update.message.reply_text(
        "📱 *Step 1/5: Phone Model*\n\n"
        "Please enter the brand and model name of the phone.\\n"
        "(e.g., *iPhone 14 Pro Max 256GB* or *Samsung Galaxy S23 Ultra*)",
        parse_mode="Markdown",
    )
    return MODEL


async def received_model(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Store phone model and prompt for description."""
    model_name = update.message.text.strip()
    if len(model_name) < 3:
        await update.message.reply_text("⚠️ Please provide a valid phone model name.")
        return MODEL

    context.user_data["phone_model"] = model_name
    await update.message.reply_text(
        f"✅ Model: *{model_name}*\\n\\n"
        "📝 *Step 2/5: Description*\\n"
        "Provide details such as condition (New/Used), battery health, storage, and accessories included.",
        parse_mode="Markdown",
    )
    return DESCRIPTION


async def received_description(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Store description and ask for price."""
    description = update.message.text.strip()
    context.user_data["description"] = description

    await update.message.reply_text(
        "💰 *Step 3/5: Price*\\n\\n"
        "Enter the selling price in USD or local currency (numbers only or with currency symbol, e.g. *650* or *$650*):",
        parse_mode="Markdown",
    )
    return PRICE


async def received_price(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Store price and ask for phone photo."""
    raw_price = update.message.text.strip().replace("$", "").replace(",", "")
    try:
        price = float(raw_price)
        context.user_data["price"] = price
    except ValueError:
        await update.message.reply_text("⚠️ Please enter a numeric price (e.g. 650 or 12000).")
        return PRICE

    await update.message.reply_text(
        "📸 *Step 4/5: Photo Upload*\\n\\n"
        "Please send a clear photo of the phone you want to sell.",
        parse_mode="Markdown",
    )
    return PHOTO


# ==========================================================
# CORE HIGHLIGHT: IMAGE UPLOAD & LOCAL FILE STORAGE HANDLER
# ==========================================================
async def received_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """
    Handle the uploaded photo:
    1. Telegram sends a list of PhotoSize objects in ascending resolution.
    2. We grab update.message.photo[-1] (the highest resolution).
    3. We download the file to disk using get_file() and download_to_drive().
    4. We also save photo.file_id to reuse in Telegram without re-uploading bandwidth.
    """
    # Grab the highest resolution photo
    photo = update.message.photo[-1]
    file_id = photo.file_id
    context.user_data["photo_file_id"] = file_id

    # Download image to local filesystem
    photo_file = await context.bot.get_file(file_id)
    local_filename = f"phone_{update.effective_user.id}_{photo.file_unique_id}.jpg"
    local_path = UPLOAD_DIR / local_filename
    
    await photo_file.download_to_drive(custom_path=str(local_path))
    context.user_data["photo_local_path"] = str(local_path)

    await update.message.reply_text(
        "✅ Photo uploaded successfully!\\n\\n"
        "📞 *Step 5/5: Owner Phone Number*\\n"
        "Please enter your phone number so buyers can reach out directly:\\n"
        "(e.g., *+1 555 019 2831* or *+251 911 234567*)",
        parse_mode="Markdown",
    )
    return PHONE


async def received_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Save owner phone number and commit the listing to database."""
    seller_phone = update.message.text.strip()
    context.user_data["seller_phone"] = seller_phone

    user = update.effective_user
    seller_name = user.full_name or user.username or "Anonymous Seller"

    # Persist to SQLite
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO listings (
            user_id, seller_name, seller_phone, phone_model,
            description, price, photo_file_id, photo_local_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user.id,
        seller_name,
        context.user_data["seller_phone"],
        context.user_data["phone_model"],
        context.user_data["description"],
        context.user_data["price"],
        context.user_data["photo_file_id"],
        context.user_data["photo_local_path"],
    ))
    listing_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # Send preview confirmation card back to user
    caption = (
        f"🎉 *Listing Published Successfully! (#TB-{listing_id:04d})*\\n\\n"
        f"📱 *Model:* {context.user_data['phone_model']}\\n"
        f"💰 *Price:* \${context.user_data['price']:,.2f}\\n"
        f"📝 *Description:* {context.user_data['description']}\\n"
        f"📞 *Seller Phone:* \`{seller_phone}\`\\n"
        f"👤 *Seller:* {seller_name}\\n\\n"
        "Buyers can now find your phone via /browse!"
    )

    await update.message.reply_photo(
        photo=context.user_data["photo_file_id"],
        caption=caption,
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )

    context.user_data.clear()
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancel the current listing creation."""
    context.user_data.clear()
    await update.message.reply_text(
        "❌ Listing creation canceled. Type /start anytime.",
        reply_markup=ReplyKeyboardRemove(),
    )
    return ConversationHandler.END


# ------------------ BUYER FLOW (Browsing Listings) ------------------

async def browse(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Display active phone listings to buyers."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, phone_model, description, price, photo_file_id, seller_phone, seller_name
        FROM listings
        WHERE status = 'active'
        ORDER BY created_at DESC
        LIMIT 10
    """)
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        await update.message.reply_text(
            "📭 No active phone listings available right now.\\n"
            "Be the first to list one with /newlisting!"
        )
        return

    await update.message.reply_text(f"🛍️ Showing {len(rows)} recent phone listings:")

    for item in rows:
        lid, model, desc, price, photo_id, phone, seller = item
        clean_phone = phone.replace(" ", "").replace("-", "")
        
        # Inline buttons for direct buyer communication
        keyboard = [
            [
                InlineKeyboardButton(f"📞 Call {phone}", url=f"tel:{clean_phone}"),
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        card_caption = (
            f"📱 *{model}*\\n"
            f"💵 *Price:* \${price:,.2f}\\n"
            f"📝 {desc}\\n\\n"
            f"👤 *Seller:* {seller}\\n"
            f"📞 *Direct Phone:* \`{phone}\`\\n"
            f"🏷️ *Listing ID:* #TB-{lid:04d}"
        )

        try:
            await update.message.reply_photo(
                photo=photo_id,
                caption=card_caption,
                parse_mode="Markdown",
                reply_markup=reply_markup,
            )
        except Exception as e:
            logger.error(f"Error sending listing {lid}: {e}")


# ------------------ MAIN ENTRYPOINT ------------------

def main():
    # Read Telegram Bot token from environment variable
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_HERE")
    init_db()

    app = ApplicationBuilder().token(token).build()

    # ConversationHandler for posting a phone
    listing_handler = ConversationHandler(
        entry_points=[CommandHandler("newlisting", new_listing)],
        states={
            MODEL: [MessageHandler(filters.TEXT & ~filters.COMMAND, received_model)],
            DESCRIPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, received_description)],
            PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, received_price)],
            PHOTO: [MessageHandler(filters.PHOTO, received_photo)],
            PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, received_phone)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("browse", browse))
    app.add_handler(listing_handler)

    print("🤖 Tolo Broker Bot is running...")
    app.run_polling()


if __name__ == "__main__":
    main()
`;

export const IMAGE_SNIPPET = `async def received_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """
    Handles image uploads in python-telegram-bot:
    1. update.message.photo is a list of PhotoSize objects sorted by size.
    2. Index [-1] is always the highest available resolution.
    3. download_to_drive saves the actual image to your server disk.
    4. photo.file_id is saved to database to resend the photo instantly without re-upload.
    """
    # 1. Extract highest resolution photo
    photo = update.message.photo[-1]
    file_id = photo.file_id
    context.user_data["photo_file_id"] = file_id

    # 2. Download to local disk (uploads/phones/...)
    photo_file = await context.bot.get_file(file_id)
    os.makedirs("uploads/phones", exist_ok=True)
    local_path = f"uploads/phones/phone_{update.effective_user.id}_{photo.file_unique_id}.jpg"
    
    await photo_file.download_to_drive(custom_path=local_path)
    context.user_data["photo_local_path"] = local_path

    await update.message.reply_text("✅ Photo saved! Next, enter your phone number:")
    return PHONE`;

export const DATABASE_SNIPPET = `import sqlite3

def init_db():
    conn = sqlite3.connect("tolo_broker.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            seller_name TEXT,
            seller_phone TEXT NOT NULL,
            phone_model TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            photo_file_id TEXT NOT NULL,
            photo_local_path TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_listing(user_id, seller_name, phone_number, model, description, price, file_id, local_path):
    conn = sqlite3.connect("tolo_broker.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO listings (
            user_id, seller_name, seller_phone, phone_model,
            description, price, photo_file_id, photo_local_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, seller_name, phone_number, model, description, price, file_id, local_path))
    listing_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return listing_id`;

export const BUYER_CARD_SNIPPET = `async def send_listing_to_buyer(update: Update, listing):
    """Send card with Telegram file_id & direct Call Seller button"""
    lid, model, desc, price, photo_id, phone, seller = listing
    clean_phone = phone.replace(" ", "").replace("-", "")

    # Create inline button that dials the seller directly
    keyboard = [
        [InlineKeyboardButton(f"📞 Call Seller ({phone})", url=f"tel:{clean_phone}")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    caption = (
        f"📱 *{model}*\\n"
        f"💵 *Price:* \${price:,.2f}\\n"
        f"📝 {desc}\\n\\n"
        f"👤 *Seller:* {seller}\\n"
        f"📞 *Phone:* \`{phone}\`\\n"
        f"🏷️ *Listing ID:* #TB-{lid:04d}"
    )

    await update.message.reply_photo(
        photo=photo_id,
        caption=caption,
        parse_mode="Markdown",
        reply_markup=reply_markup
    )`;
