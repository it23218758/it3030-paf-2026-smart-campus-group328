import subprocess

try:
    result = subprocess.run(["gradlew.bat", "compileJava", "--console=plain"], 
                            capture_output=True, text=True, check=True)
    print("SUCCESS")
    print(result.stdout)
except subprocess.CalledProcessError as e:
    print("ERROR OUT")
    print(e.stdout)
    print("ERROR ERR")
    print(e.stderr)
