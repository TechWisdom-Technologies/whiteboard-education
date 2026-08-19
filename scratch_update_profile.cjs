const fs = require('fs');

let content = fs.readFileSync('src/pages/partner/PartnerProfile.tsx', 'utf8');

// Update PartnerData interface
const interfaceRegex = /interface PartnerData \{([\s\S]*?)\}/;
let match = content.match(interfaceRegex);
if (match) {
  let inner = match[1];
  if (!inner.includes('registration_number')) {
    inner += `  registration_number?: string;\n  nid_document_url?: string;\n  trade_license_url?: string;\n`;
    content = content.replace(match[1], inner);
  }
}

// Update fetchData
const fetchDataRegex = /const fetchData = async \(\) => \{[\s\S]*?setLoading\(false\);\n    \};/;
const newFetchData = `const fetchData = async () => {
      try {
        const localAvatar = localStorage.getItem(\`partner_avatar_\${user.id}\`);
        if (localAvatar) {
          setProfile(prev => ({ ...prev, avatar_url: localAvatar }));
        }

        const { data: partnerData } = await supabase
          .from("partner_registrations")
          .select("agency_name, contact_first_name, contact_last_name, email, phone, country, annual_students, status, admin_notes, certificate_urls, website_url, registration_number, agency_email, agency_phone, rep_email, rep_phone, facebook_url, linkedin_url, instagram_url, youtube_url, nid_document_url, trade_license_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (partnerData) {
          const pData: PartnerData = {
            agency_name: partnerData.agency_name || "",
            agency_email: partnerData.agency_email || partnerData.email || "",
            agency_phone: partnerData.agency_phone || partnerData.phone || "",
            country: partnerData.country || "",
            annual_students: partnerData.annual_students || 0,
            website_url: partnerData.website_url || "",
            facebook_url: partnerData.facebook_url || "",
            linkedin_url: partnerData.linkedin_url || "",
            instagram_url: partnerData.instagram_url || "",
            youtube_url: partnerData.youtube_url || "",
            contact_first_name: partnerData.contact_first_name || "",
            contact_last_name: partnerData.contact_last_name || "",
            rep_phone: partnerData.rep_phone || partnerData.phone || "",
            rep_email: partnerData.rep_email || partnerData.email || "",
            status: partnerData.status || "pending",
            admin_notes: partnerData.admin_notes || "",
            certificate_urls: partnerData.certificate_urls,
            registration_number: partnerData.registration_number || "",
            nid_document_url: partnerData.nid_document_url || "",
            trade_license_url: partnerData.trade_license_url || "",
          };
          setPartner(pData);
          setEditAgencyData({
            agency_name: pData.agency_name,
            contact_first_name: pData.contact_first_name,
            contact_last_name: pData.contact_last_name,
            country: pData.country,
            agency_email: pData.agency_email,
            agency_phone: pData.agency_phone,
            rep_phone: pData.rep_phone,
            rep_email: pData.rep_email,
            website_url: pData.website_url,
            facebook_url: pData.facebook_url,
            linkedin_url: pData.linkedin_url,
            instagram_url: pData.instagram_url,
            youtube_url: pData.youtube_url,
            annual_students: pData.annual_students,
          });
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile({
            display_name: profileData.display_name || "",
            avatar_url: profileData.avatar_url || localAvatar || "",
          });
          if (profileData.avatar_url) {
            localStorage.setItem(\`partner_avatar_\${user.id}\`, profileData.avatar_url);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    };`;
content = content.replace(fetchDataRegex, newFetchData);

// Update handleSaveProfile
const handleSaveProfileRegex = /const handleSaveProfile = async \(\) => \{[\s\S]*?setIsEditingAgency\(false\);\n  \};/;
const newHandleSaveProfile = `const handleSaveProfile = async () => {
    if (!user) return;
    setSavingAgency(true);
    try {
      const { error } = await supabase.from("partner_registrations").update({
        agency_name: editAgencyData.agency_name,
        contact_first_name: editAgencyData.contact_first_name,
        contact_last_name: editAgencyData.contact_last_name,
        country: editAgencyData.country,
        annual_students: editAgencyData.annual_students,
        website_url: editAgencyData.website_url,
        agency_email: editAgencyData.agency_email,
        agency_phone: editAgencyData.agency_phone,
        rep_email: editAgencyData.rep_email,
        rep_phone: editAgencyData.rep_phone,
        facebook_url: editAgencyData.facebook_url,
        linkedin_url: editAgencyData.linkedin_url,
        instagram_url: editAgencyData.instagram_url,
        youtube_url: editAgencyData.youtube_url,
      }).eq("user_id", user.id);

      if (error) throw error;
      
      setPartner((prev) => prev ? {
        ...prev,
        ...editAgencyData,
      } : null);
      
      toast.success("Profile updated successfully");
      setIsEditingAgency(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingAgency(false);
    }
  };`;
content = content.replace(handleSaveProfileRegex, newHandleSaveProfile);

fs.writeFileSync('src/pages/partner/PartnerProfile.tsx', content);
console.log('PartnerProfile.tsx updated');
