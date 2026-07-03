import os
import sys
from PIL import Image

# Configuration
DEFAULT_TARGET_DIRS = [
    r"assets/images/maps",
    r"assets/images/operators"
]
MAX_SIZE = (400, 400)
SIZE_THRESHOLD_KB = 200  # Only compress images larger than 200KB

def compress_images(target_dirs):
    print("=" * 60)
    print("      TACTICAL IMAGE OPTIMIZATION UTILITY")
    print("=" * 60)
    
    total_files_processed = 0
    total_saved_bytes = 0

    for directory in target_dirs:
        # Resolve path relative to the project root
        resolved_dir = os.path.abspath(directory)
        if not os.path.exists(resolved_dir):
            print(f"[!] Directory not found: {directory} (skipping)")
            continue
            
        print(f"\nScanning: {directory}...")
        
        for filename in os.listdir(resolved_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                filepath = os.path.join(resolved_dir, filename)
                original_size = os.path.getsize(filepath)
                
                # Check size threshold
                if original_size > SIZE_THRESHOLD_KB * 1024:
                    try:
                        with Image.open(filepath) as img:
                            # Keep aspect ratio and resize to fit within MAX_SIZE
                            img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                            
                            # Preserve original format
                            img_format = img.format if img.format else 'PNG'
                            
                            # Save back in-place
                            if img_format == 'PNG':
                                img.save(filepath, format=img_format, optimize=True)
                            else:
                                img.save(filepath, format=img_format, quality=85, optimize=True)
                                
                        new_size = os.path.getsize(filepath)
                        saved_bytes = original_size - new_size
                        total_saved_bytes += saved_bytes
                        total_files_processed += 1
                        
                        pct = (saved_bytes / original_size) * 100
                        print(f" [+] Optimized: {filename} ({original_size/1024/1024:.2f}MB -> {new_size/1024:.2f}KB | -{pct:.1f}%)")
                    except Exception as e:
                        print(f" [X] Error processing {filename}: {e}")
                else:
                    # File is already below the size threshold
                    pass

    print("\n" + "=" * 60)
    print(f"Optimization finished.")
    print(f" - Images optimized: {total_files_processed}")
    print(f" - Total space saved: {total_saved_bytes / 1024 / 1024:.2f} MB")
    print("=" * 60)

if __name__ == "__main__":
    # If paths are passed via command line arguments, use them, otherwise use defaults
    paths = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_TARGET_DIRS
    compress_images(paths)
