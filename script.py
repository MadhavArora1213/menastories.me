import gdown
import os
import requests
from docx import Document
# ===== 1️⃣ CONFIG =====

folder_url = "https://drive.google.com/drive/folders/1uIgZB9MH_i1-L5WmYW4jnXwLL-NvKOwQ"
try:
    gdown.download_folder(folder_url, output='articles', quiet=False)
    print("Successfully downloaded files from Google Drive")
except Exception as e:
    print(f"Failed to download from Google Drive: {e}")
    print("Falling back to local 'articles' folder...")
    if not os.path.exists('articles'):
        print("Local 'articles' folder not found. Please either:")
        print("1. Make the Google Drive folder public (Anyone with link can view)")
        print("2. Or manually create an 'articles' folder and place your DOCX and image files there")
        exit(1)
    print("Using local 'articles' folder")

# Admin login to get token
def login_admin():
    login_url = "http://localhost:5000/api/admin/auth/login"
    login_data = {
        "email": "masteradmin1@magazine.com",
        "password": "MasterAdmin@123"
    }
    response = requests.post(login_url, json=login_data)
    if response.status_code == 200:
        data = response.json()
        return data.get("token")
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

# Get category ID by name
def get_category_id(category_name, token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get("http://localhost:5000/api/categories", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Available categories: {[cat.get('name') for cat in data.get('data', [])]}")
        categories = data.get("data", [])
        for category in categories:
            if category.get("name", "").lower() == category_name.lower():
                return category.get("id")
    print(f"Category '{category_name}' not found")
    return None

# Get author ID by name
def get_author_id(author_name, token):
    headers = {"Authorization": f"Bearer {token}"}

    # Try different author endpoints
    endpoints = [
        "http://localhost:5000/api/articles/authors/all",
        "http://localhost:5000/api/articles/authors/filtered",
        "http://localhost:5000/api/authors/all",
        "http://localhost:5000/api/authors/filtered"
    ]

    for endpoint in endpoints:
        print(f"Trying authors endpoint: {endpoint}")
        response = requests.get(endpoint, headers=headers)
        print(f"Response status: {response.status_code}")

        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response data keys: {list(data.keys()) if isinstance(data, dict) else 'not dict'}")

                # Handle different response formats
                authors = []
                if isinstance(data, list):
                    authors = data
                elif isinstance(data, dict):
                    authors = data.get("data", []) or data.get("authors", [])

                print(f"Found {len(authors)} authors")
                if authors:
                    print(f"Available authors: {[author.get('name') for author in authors[:3]]}")  # Show first 3

                    # Look for specific author
                    for author in authors:
                        if author.get("name", "").lower() == author_name.lower():
                            return author.get("id")

                    # Use first available author as fallback
                    fallback_author = authors[0]
                    print(f"Using fallback author: {fallback_author.get('name')}")
                    return fallback_author.get("id")
            except Exception as e:
                print(f"Error parsing response: {e}")
                continue

    print(f"No working authors endpoint found")
    # Since author endpoints don't exist, use a dummy author ID
    # In a real implementation, you'd create the author in the database
    print("Using dummy author ID for development...")
    # Use a dummy UUID that might work if the database has default authors
    dummy_author_id = "00000000-0000-0000-0000-000000000001"
    print(f"Using dummy author ID: {dummy_author_id}")
    return dummy_author_id

# Get admin token
ADMIN_TOKEN = login_admin()
if not ADMIN_TOKEN:
    print("Failed to authenticate as admin")
    exit(1)

print("Admin authenticated successfully")
DRIVE_FOLDER = 'articles'
IMG_FOLDER = os.path.join(DRIVE_FOLDER, "PNG")

# Create directories if they don't exist
if not os.path.exists(DRIVE_FOLDER):
    os.makedirs(DRIVE_FOLDER)
if not os.path.exists(IMG_FOLDER):
    os.makedirs(IMG_FOLDER)
API_URL = "http://localhost:5000/api/articles"  # Your local backend URL

# ===== 2️⃣ Automatically detect DOCX file =====
docx_files = [f for f in os.listdir(DRIVE_FOLDER) if f.lower().endswith(".docx")]

if not docx_files:
    raise FileNotFoundError(f"No .docx file found in {DRIVE_FOLDER}")

DOC_FILE = os.path.join(DRIVE_FOLDER, docx_files[0])
print(f"Using DOCX file: {DOC_FILE}")

# ===== 3️⃣ Parse DOCX =====
def parse_docx(file_path):
    """
    Extract article fields from DOCX based on structured content.
    Returns a dictionary mapping field names to values.
    """
    doc = Document(file_path)
    content_map = {}

    # First pass: extract all paragraphs
    all_paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            all_paragraphs.append(text)

    print(f"Found {len(all_paragraphs)} paragraphs in DOCX")

    # Look for field patterns - handle both single line and multi-line formats
    i = 0
    while i < len(all_paragraphs):
        para = all_paragraphs[i]

        # Check for field labels (with or without colon)
        field_label = None
        field_value = None

        if ":" in para:
            # Single line format: "Title: The Future..."
            parts = para.split(":", 1)
            field_label = parts[0].strip()
            field_value = parts[1].strip() if len(parts) > 1 else ""
        else:
            # Check if this is a field label
            potential_label = para.strip()
            field_labels = [
                "Title", "Title *", "Subtitle", "Content", "Content *",
                "Excerpt", "Description", "Meta Title", "Meta Description",
                "Scheduled Publish Date", "Featured Article", "Show in Hero Slider",
                "Add to Trending", "Pin to Top", "Allow Comments",
                "Category", "Category *", "Primary Author", "Primary Author *",
                "Author Bio Override", "Tags", "Tags *"
            ]

            if potential_label in field_labels:
                field_label = potential_label
                # Look for the value in the next paragraph
                if i + 1 < len(all_paragraphs):
                    field_value = all_paragraphs[i + 1].strip()
                    i += 1  # Skip the next paragraph since we used it as value

        if field_label:
            # Map field labels to database field names
            field_mapping = {
                "Title": "title",
                "Title *": "title",
                "Subtitle": "subtitle",
                "Content": "content",
                "Content *": "content",
                "Excerpt": "excerpt",
                "Description": "description",
                "Meta Title": "meta_title",
                "Meta Description": "meta_description",
                "Scheduled Publish Date": "scheduled_date",
                "Featured Article": "featured_article",
                "Show in Hero Slider": "show_in_slider",
                "Add to Trending": "add_to_trending",
                "Pin to Top": "pin_to_top",
                "Allow Comments": "allow_comments",
                "Category": "category",
                "Category *": "category",
                "Primary Author": "author",
                "Primary Author *": "author",
                "Author Bio Override": "author_bio",
                "Tags": "tags",
                "Tags *": "tags"
            }

            if field_label in field_mapping:
                db_field = field_mapping[field_label]

                # Handle boolean fields
                if db_field in ["featured_article", "show_in_slider", "add_to_trending", "pin_to_top", "allow_comments"]:
                    content_map[db_field] = field_value.lower() in ["yes", "true", "1", "Yes"]
                else:
                    content_map[db_field] = field_value

        i += 1

    # If still no title/content, try to extract from document structure
    if not content_map.get("title"):
        # Look for the first substantial paragraph after "Basic Information"
        for i, para in enumerate(all_paragraphs):
            if para == "Basic Information" and i + 1 < len(all_paragraphs):
                # Look for title in next few paragraphs
                for j in range(i + 1, min(i + 5, len(all_paragraphs))):
                    if "Title" in all_paragraphs[j] and ":" in all_paragraphs[j]:
                        parts = all_paragraphs[j].split(":", 1)
                        if len(parts) > 1:
                            content_map["title"] = parts[1].strip()
                            break
                break

    if not content_map.get("content"):
        # Look for content after title
        content_started = False
        content_parts = []
        for para in all_paragraphs:
            if "Content" in para and ":" in para:
                content_started = True
                parts = para.split(":", 1)
                if len(parts) > 1:
                    content_parts.append(parts[1].strip())
            elif content_started and para not in ["Excerpt", "Description", "Meta Title", "Meta Description"]:
                if not para.startswith(("Excerpt:", "Description:", "Meta Title:", "Meta Description:")):
                    content_parts.append(para)
                else:
                    break

        if content_parts:
            content_map["content"] = " ".join(content_parts)

    return content_map

# ===== 4️⃣ Upload article =====
def upload_article():
    article_data = parse_docx(DOC_FILE)

    # Debug: Print parsed data
    print("Parsed article data:")
    for key, value in article_data.items():
        print(f"  {key}: {repr(value)}")

    # Generate slug from title if available
    title = article_data.get("title")
    slug = None
    if title:
        # Simple slug generation
        import re
        slug = re.sub(r'[^\w\s-]', '', title).strip().lower()
        slug = re.sub(r'[-\s]+', '-', slug)

    # Clean up category (remove "Category *:" prefix if present)
    category = article_data.get("category", "")
    if category:
        # Remove any "Category" or "Category *:" prefixes
        if "Category" in category:
            parts = category.split(":", 1)
            if len(parts) > 1:
                category = parts[1].strip()
            else:
                category = category.replace("Category", "").replace("*", "").strip()

    # Convert tags string to JSON array
    tags_str = article_data.get("tags", "")
    tags_array = []
    if tags_str:
        # Split by comma and clean up
        tags_array = [tag.strip() for tag in tags_str.split(",") if tag.strip()]

    print(f"Cleaned category: {repr(category)}")
    print(f"Converted tags: {repr(tags_array)}")

    # Look up IDs for category and author
    category_id = get_category_id(category, ADMIN_TOKEN) if category else None

    # If Technology category not found, use BUSINESS & LEADERSHIP as fallback
    if not category_id:
        print(f"Using fallback category: BUSINESS & LEADERSHIP")
        category_id = get_category_id("BUSINESS & LEADERSHIP", ADMIN_TOKEN)

    author_name = article_data.get("author", "").split("(")[0].strip() if article_data.get("author") else ""
    author_id = get_author_id(author_name, ADMIN_TOKEN) if author_name else None

    # If author not found, try to find any existing author as fallback
    if not author_id:
        print("Author not found, looking for fallback author...")
        headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
        response = requests.get("http://localhost:5000/api/users", headers=headers)
        if response.status_code == 200:
            data = response.json()
            users = data.get("data", [])
            if users:
                author_id = users[0].get("id")  # Use first available author
                print(f"Using fallback author ID: {author_id}")

    print(f"Final Category ID: {category_id}")
    print(f"Final Author ID: {author_id}")

    # Prepare payload with correct field names for the API
    # Convert arrays to JSON strings for proper form-data transmission
    import json
    payload = {
        "title": title,
        "slug": slug,
        "subtitle": article_data.get("subtitle"),
        "content": article_data.get("content"),
        "excerpt": article_data.get("excerpt"),
        "description": article_data.get("description"),
        "meta_title": article_data.get("meta_title"),
        "meta_description": article_data.get("meta_description"),
        "scheduled_publish_date": article_data.get("scheduled_date"),
        "is_featured": article_data.get("featured_article"),
        "is_hero_slider": article_data.get("show_in_slider"),
        "is_trending": article_data.get("add_to_trending"),
        "is_pinned": article_data.get("pin_to_top"),
        "allow_comments": article_data.get("allow_comments"),
        "category_id": category_id,
        "primary_author_id": author_id,
        "author_bio_override": article_data.get("author_bio"),
        "tags": json.dumps(tags_array),  # Convert to JSON string
    }

    # ===== Files upload =====
    # Temporarily disabled file uploads to test text data only
    files = {}
    gallery_files = []

    # Combine all files (empty for now)
    all_files_list = list(files.items()) + gallery_files

    # ===== POST request =====
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    response = requests.post(API_URL, data=payload, files=all_files_list, headers=headers)

    # Close files
    for f in files.values():
        f.close()
    for _, f in gallery_files:
        f.close()

    print("Upload Response:", response.status_code)
    print(response.text)

# ===== 5️⃣ Run =====
if __name__ == "__main__":
    upload_article()
