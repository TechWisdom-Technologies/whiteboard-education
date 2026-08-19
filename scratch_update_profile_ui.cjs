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

const docsHtml = `
              <div className="pt-8 border-t border-slate-100 mt-8">
                <h3 className="text-lg font-medium text-black mb-4">Verification Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">National ID (NID)</p>
                    {partner?.nid_document_url ? (
                      <a href={partner.nid_document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#2F4F97] hover:underline">
                        View Document <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="text-[14px] text-slate-400 italic">Not provided</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trade License</p>
                    {partner?.trade_license_url ? (
                      <a href={partner.trade_license_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#2F4F97] hover:underline">
                        View Document <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="text-[14px] text-slate-400 italic">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
`;

// Inject Registration Number in Display Mode
if (content.includes('Agency Information') && !content.includes('Registration Number')) {
  // Try to find the agency_name display logic
  const anchor = /<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agency Name<\/p>\s*<p className="text-\[15px\] font-medium text-slate-900">\{partner\.agency_name\}<\/p>\s*<\/div>/;
  content = content.replace(anchor, match => match + regDisplayHtml);
  
  // Try to find the edit mode
  const editAnchor = /<Label className="text-\[11px\] font-bold text-slate-500 uppercase">Agency Name<\/Label>\s*<Input value=\{editAgencyData\.agency_name\} [^>]+ \/>\s*<\/div>/;
  content = content.replace(editAnchor, match => match + regEditHtml);
  
  // Inject Verification Documents section before "Social Media Links" or before closing of the main card
  const docsAnchor = /<div className="pt-8 border-t border-slate-100">/;
  content = content.replace(docsAnchor, match => docsHtml + '\n              ' + match);
  
  fs.writeFileSync('src/pages/partner/PartnerProfile.tsx', content);
  console.log('PartnerProfile UI updated');
} else {
  console.log('UI updates failed or already applied');
}
