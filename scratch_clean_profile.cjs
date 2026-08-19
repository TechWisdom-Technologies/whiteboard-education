const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/PartnerProfile.tsx', 'utf8');

const regDisplayHtml = `
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Number</p>
                      <p className="text-[15px] font-medium text-slate-900">{partner.registration_number || 'N/A'}</p>
                    </div>`;

const regEditHtml = `
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Registration Number</Label>
                      <Input value={editAgencyData.registration_number || ""} onChange={e => setEditAgencyData({...editAgencyData, registration_number: e.target.value})} className="h-11 rounded-xl bg-white shadow-sm border-slate-200" />
                    </div>`;

const docsHtmlRegex = /<div className="pt-8 border-t border-slate-100 mt-8">\s*<h3 className="text-lg font-medium text-black mb-4">Verification Documents<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*/;

content = content.replace(regDisplayHtml, '');
content = content.replace(regEditHtml, '');
content = content.replace(docsHtmlRegex, '');

fs.writeFileSync('src/pages/partner/PartnerProfile.tsx', content);
console.log('PartnerProfile UI cleaned');
