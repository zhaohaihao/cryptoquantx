import shutil
import os

source_base = r"c:\Users\ralph\IdeaProject\cryptoquantx"
dest_base = r"c:\Users\ralph\IdeaProject\okx-trading"

mappings = [
    ("temp_TelegramChannelRepository.java", r"src\main\java\com\okx\trading\repository\TelegramChannelRepository.java"),
    ("temp_TelegramMessageRepository.java", r"src\main\java\com\okx\trading\repository\TelegramMessageRepository.java"),
    ("temp_TelegramController.java", r"src\main\java\com\okx\trading\controller\TelegramController.java")
]

for src_file, dest_rel_path in mappings:
    src_path = os.path.join(source_base, src_file)
    dest_path = os.path.join(dest_base, dest_rel_path)
    
    print(f"Moving {src_path} to {dest_path}")
    
    if os.path.exists(src_path):
        # Ensure dest dir exists
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        try:
            shutil.copy2(src_path, dest_path)
            os.remove(src_path)
            print(f"Successfully moved {src_file}")
        except Exception as e:
            print(f"Error moving {src_file}: {e}")
    else:
        print(f"Source file {src_file} not found")
