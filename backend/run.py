#!/usr/bin/env python3
import sys
import os
from pathlib import Path

# Добавляем путь к backend в sys.path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

print(f"Backend directory: {backend_dir}")
print(f"Python path: {sys.path}")

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    uvicorn.run(
        "app.main:app",  # теперь это будет работать, потому что backend_dir в пути
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir)]
    )