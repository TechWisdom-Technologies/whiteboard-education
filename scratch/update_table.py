import re

with open("src/pages/StudentProfilePage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_table = """                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                            <TableHead className="text-[13px] font-bold text-gray-900 whitespace-nowrap w-[100px]">App ID</TableHead>
                            <TableHead className="text-[13px] font-bold text-gray-900 whitespace-nowrap w-[100px]">Date created</TableHead>
                            <TableHead className="text-[13px] font-bold text-gray-900 min-w-[140px]">University</TableHead>
                            <TableHead className="text-[13px] font-bold text-gray-900 min-w-[140px]">Program</TableHead>
                            <TableHead className="text-[13px] font-bold text-gray-900 whitespace-nowrap w-[80px]">Intake</TableHead>
                            <TableHead className="text-[13px] font-bold text-gray-900 min-w-[100px]">Created By</TableHead>
                            <TableHead className="text-[13px] font-bold text-gray-900 whitespace-nowrap w-[120px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applications.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-mono text-xs font-semibold text-[#2F4F97] whitespace-nowrap">
                                {app.application_code}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                {new Date(app.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">
                                {app.universities?.name || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">
                                {app.courses?.title || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                {app.courses?.intake_months?.[0] || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                {student?.partner_id === app.partner_id ? "Partner" : "Admin"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant="outline" className={`${statusColors[app.status] || "bg-gray-100 text-gray-800"} text-[10px] px-2 border-transparent whitespace-nowrap`}>
                                  {getStatusLabel(app.status)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>"""

content = re.sub(r'<Table>[\s\S]*?</Table>', new_table, content, count=1)

with open("src/pages/StudentProfilePage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
