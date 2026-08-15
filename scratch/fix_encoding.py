import re

with open("src/pages/StudentProfilePage.tsx", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

content = content.replace('|| "?""', '|| "—"')
content = content.replace('|| "\\?""', '|| "—"')
content = content.replace('|| "?""', '|| "—"')
content = content.replace('|| "?"', '|| "—"')

# Also let's just do a regex replace for the specific block
table_block_pattern = r'<TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">\s*{\s*app\.universities\?\.name \|\| "[^"]*"\s*}\s*</TableCell>'
replacement1 = '<TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">\n                                {app.universities?.name || "—"}\n                              </TableCell>'
content = re.sub(table_block_pattern, replacement1, content)

table_block_pattern2 = r'<TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">\s*{\s*app\.courses\?\.title \|\| "[^"]*"\s*}\s*</TableCell>'
replacement2 = '<TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">\n                                {app.courses?.title || "—"}\n                              </TableCell>'
content = re.sub(table_block_pattern2, replacement2, content)

table_block_pattern3 = r'<TableCell className="text-xs text-gray-900 whitespace-nowrap">\s*{\s*app\.courses\?\.intake_months\?\.\[0\] \|\| "[^"]*"\s*}\s*</TableCell>'
replacement3 = '<TableCell className="text-xs text-gray-900 whitespace-nowrap">\n                                {app.courses?.intake_months?.[0] || "—"}\n                              </TableCell>'
content = re.sub(table_block_pattern3, replacement3, content)


with open("src/pages/StudentProfilePage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
