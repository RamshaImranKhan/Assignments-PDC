import os
import time
from supabase import create_client, Client
from concurrent.futures import ThreadPoolExecutor


SUPABASE_URL = "https://ldusicfsxhgpavtlvxbs.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdXNpY2ZzeGhncGF2dGx2eGJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAxNjYxNiwiZXhwIjoyMDc4NTkyNjE2fQ.JUM-WAq62qmtgUWtHkuUwKZrAvdkbFEl-dHHZ236rgs"  # Use Service Role Key
BUCKET_NAME = "upload-bucket" 
FOLDER_PATH = "supabase_upload_test"   


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_file(file_name):
    """Upload a single file to Supabase Storage."""
    file_path = os.path.join(FOLDER_PATH, file_name)
    try:
        with open(file_path, "rb") as f:
            supabase.storage.from_(BUCKET_NAME).upload(file_name, f.read())
        print(f"✅ Uploaded: {file_name}")
    except Exception as e:
        print(f"❌ Failed to upload {file_name}: {e}")
    return file_name


def upload_sequential(files):
    """Upload files one by one (sequentially)."""
    start = time.time()
    for f in files:
        upload_file(f)
    end = time.time()
    return end - start


def upload_parallel(files, max_workers=5):
    """Upload files in parallel using threads."""
    start = time.time()
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        executor.map(upload_file, files)
    end = time.time()
    return end - start


if __name__ == "__main__":
    workloads = [10, 20, 25]           
    thread_counts = [1, 5, 10]        

    for n_files in workloads:
        files = os.listdir(FOLDER_PATH)[:n_files]
        print(f"\n=== Uploading {n_files} files ===")
       
        print("\nSequential upload:")
        seq_time = upload_sequential(files)
        print(f"Sequential time: {seq_time:.2f} seconds")

        for threads in thread_counts:
            print(f"\nParallel upload with {threads} threads:")
            par_time = upload_parallel(files, max_workers=threads)
            print(f"Time: {par_time:.2f} seconds")

        print("\n------------------------------------")
