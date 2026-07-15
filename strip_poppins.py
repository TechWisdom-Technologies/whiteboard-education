import os
import glob

def strip_poppins():
    src_dir = r"g:\TECHWISDOM\Clients\world-class-aid\src"
    tsx_files = glob.glob(os.path.join(src_dir, "**", "*.tsx"), recursive=True)
    
    for filepath in tsx_files:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        if "fontFamily" in content:
            # Replace style={{ fontFamily: "Poppins, sans-serif" }} with nothing
            # Also handle if it's the only style, e.g. style={{ fontFamily: "Poppins, sans-serif" }} -> ""
            # Wait, if there are other styles like style={{ fontFamily: "...", color: "..." }} we need to be careful.
            # Let's just do a string replacement for the exact matches first, as they are usually alone.
            content = content.replace(' style={{ fontFamily: "Poppins, sans-serif" }}', '')
            content = content.replace('style={{ fontFamily: "Poppins, sans-serif" }}', '')
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

if __name__ == "__main__":
    strip_poppins()
