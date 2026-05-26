# Quick Reference — Bambeh Dead Code Cleanup

## Run order

```
Phase 1  →  Phase 2 (after grep)  →  Phase 3 (after import migration)
```

## Commands

### Git Bash / WSL / macOS
```bash
cd C:/Dev/bambe-android      # or your project root
bash migrate.sh
```

### PowerShell (Windows)
```powershell
cd C:\Dev\bambe-android
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\migrate.ps1
```

### Restore a single file
```bash
# Bash
cp _dead_code_quarantine/src/utils/animations.ts src/utils/animations.ts

# PowerShell
Copy-Item "_dead_code_quarantine\src\utils\animations.ts" "src\utils\animations.ts"
```

### Restore everything (full rollback)
```bash
# Bash
cp -r _dead_code_quarantine/src/* src/

# PowerShell
Copy-Item "_dead_code_quarantine\src\*" "src\" -Recurse -Force
```

### Permanently delete quarantine (after successful test)
```bash
# Bash
rm -rf _dead_code_quarantine/

# PowerShell
Remove-Item _dead_code_quarantine -Recurse -Force
```

## Phase 2 grep commands (run BEFORE uncommenting Phase 2 lines)

```bash
# Bash
grep -r "BuyZerm\|SellZerm\|SellItem\|AddItem\|MyListings\|MyContacts\|Advertisements\|ExchangeItem" \
  src/ --include="*.tsx" --include="*.ts" -l

# PowerShell
Select-String -Path "src\**\*.tsx","src\**\*.ts" `
  -Pattern "BuyZerm|SellZerm|SellItem|AddItem|MyListings|MyContacts|Advertisements|ExchangeItem" `
  -Recurse | Select-Object Filename,LineNumber,Line
```

## Phase 3 firebase import update (one-liner, Bash)

```bash
# Preview what would change (dry run)
grep -r "from.*firebase" src/ --include="*.ts" --include="*.tsx" -l

# After manually reviewing each file, update imports to:
# import { auth, db, storage } from '@/utils/firebase/firebaseConfig';
```

## Files summary

| File | Purpose |
|---|---|
| `migrate.sh` | Main script — Bash/WSL/macOS |
| `migrate.ps1` | Main script — PowerShell/Windows |
| `PHASE3_DUPLICATES.md` | Step-by-step guide for each duplicate pair |
| `README.md` | Overview and instructions |
| `QUICKREF.md` | This file |
| `_dead_code_quarantine/MANIFEST.txt` | Auto-generated log of every moved file |
