import os

def collect_js_files(base_dir, output_file):
    with open(output_file, 'w', encoding='utf-8') as out_file:
        for root, _, files in os.walk(base_dir):
            for file in files:
                if file.endswith(('.js', '.jsx', '.tsx')):
                    full_path = os.path.join(root, file)
                    relative_path = os.path.relpath(full_path, base_dir)
                    out_file.write(f"/{relative_path} :\n\n")

                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        out_file.write(content)

                    out_file.write("\n\n------------------------\n\n")

# Example usage:
base_path = r"C:\ProjectsForHire\Foodie\foodie-app"
collect_js_files(os.path.join(base_path, 'components'), 'Components.txt')
collect_js_files(os.path.join(base_path, 'lib'), 'Lib.txt')
collect_js_files(os.path.join(base_path, 'app'), 'App.txt')