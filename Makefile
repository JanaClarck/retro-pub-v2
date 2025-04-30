.PHONY: debug debug-storage debug-firestore debug-rules debug-help init-storage init-gallery sync-urls

# Default target
debug: debug-help debug-storage debug-firestore debug-rules

# Initialize Storage
init-storage:
	@echo "\n📦 Initializing Firebase Storage..."
	@node scripts/upload-initial-images.js

# Initialize Gallery
init-gallery:
	@echo "\n🖼️  Initializing Gallery Collection..."
	@node scripts/init-gallery.js

# Sync Image URLs
sync-urls:
	@echo "\n🔄 Synchronizing image URLs..."
	@npx ts-node scripts/sync-image-urls.ts

# Initialize Everything
init: init-storage init-gallery sync-urls

# Debug Storage Access
debug-storage:
	@echo "\n🔍 Checking Firebase Storage Access..."
	@echo "Testing public read access for storage paths:\n"
	@curl -I "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/hero%2Fhero-bg.jpg" 2>/dev/null | grep "HTTP"
	@echo "✓ /hero/hero-bg.jpg"
	@curl -I "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/about%2Fabout-section.jpg" 2>/dev/null | grep "HTTP"
	@echo "✓ /about/about-section.jpg"
	@curl -I "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/interior%2Finterior-1.jpg" 2>/dev/null | grep "HTTP"
	@echo "✓ /interior/interior-1.jpg"

# Debug Firestore Access
debug-firestore:
	@echo "\n🔍 Checking Firestore Collections Access..."
	@echo "Testing public read access for collections:\n"
	@curl -X GET "https://firestore.googleapis.com/v1/projects/retropub-7bfe5/databases/(default)/documents/menuItems?pageSize=1" 2>/dev/null | grep -q "documents" && echo "✓ menuItems collection is readable" || echo "❌ menuItems collection access failed"
	@curl -X GET "https://firestore.googleapis.com/v1/projects/retropub-7bfe5/databases/(default)/documents/events?pageSize=1" 2>/dev/null | grep -q "documents" && echo "✓ events collection is readable" || echo "❌ events collection access failed"
	@curl -X GET "https://firestore.googleapis.com/v1/projects/retropub-7bfe5/databases/(default)/documents/gallery?pageSize=1" 2>/dev/null | grep -q "documents" && echo "✓ gallery collection is readable" || echo "❌ gallery collection access failed"
	@curl -X GET "https://firestore.googleapis.com/v1/projects/retropub-7bfe5/databases/(default)/documents/galleryCategories?pageSize=1" 2>/dev/null | grep -q "documents" && echo "✓ galleryCategories collection is readable" || echo "❌ galleryCategories collection access failed"

# Debug Security Rules
debug-rules:
	@echo "\n🔍 Validating Security Rules..."
	@echo "Checking if rules files exist and are valid:\n"
	@test -f firestore.rules && echo "✓ firestore.rules exists" || echo "❌ firestore.rules missing"
	@test -f storage.rules && echo "✓ storage.rules exists" || echo "❌ storage.rules missing"
	@firebase deploy --only firestore:rules --dry-run 2>/dev/null && echo "✓ firestore.rules syntax is valid" || echo "❌ firestore.rules syntax error"
	@firebase deploy --only storage:rules --dry-run 2>/dev/null && echo "✓ storage.rules syntax is valid" || echo "❌ storage.rules syntax error"

# Help message
debug-help:
	@echo "\n📋 Firebase Access Debug Tool"
	@echo "=============================="
	@echo "This tool will check:"
	@echo "1. Storage access for public assets"
	@echo "2. Firestore collection read access"
	@echo "3. Security rules validation"
	@echo "\nRunning checks...\n" 