const fs = require('fs');

const replacement = `
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Group 1: Basic Info & Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[13px] font-semibold text-gray-700">Course Title *</Label>
            <Input 
              value={form.title} 
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} 
              placeholder="e.g. BSc (Hons) Computer Science" 
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">University *</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
              value={form.university_id}
              onChange={(e) => setForm(prev => ({ ...prev, university_id: e.target.value }))}
            >
              <option value="">Select University...</option>
              {universities?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Qualification Level</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
              value={form.degree_level}
              onChange={(e) => setForm(prev => ({ ...prev, degree_level: e.target.value }))}
            >
              <option value="">Select Qualification...</option>
              {DEGREE_LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Duration</Label>
            <Input 
              value={form.duration} 
              onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))} 
              placeholder="e.g. 3 Years, 4 Years" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Intake Months</Label>
            <div className="flex gap-2">
              <Input 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("intake_months", newTag, setNewTag))}
                placeholder="e.g. January, September"
              />
              <Button type="button" variant="secondary" onClick={() => addTag("intake_months", newTag, setNewTag)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.intake_months.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-3 py-1 rounded-full text-gray-700">
                  {m} <button onClick={() => removeTag("intake_months", i)} className="text-red-500 font-bold ml-1 hover:text-red-700">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[13px] font-semibold text-gray-700">English Requirements</Label>
              <Button variant="ghost" size="sm" onClick={addEnglishReq} className="text-xs h-7 px-2 text-primary hover:bg-primary/10">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {Object.entries(form.entry_requirements).length === 0 && (
                <p className="text-xs text-muted-foreground italic">No English requirements added.</p>
              )}
              {Object.entries(form.entry_requirements).map(([key, val], i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    placeholder="e.g. IELTS" 
                    value={key} 
                    className="w-1/2"
                    onChange={(e) => updateEnglishReq(key, e.target.value, val)}
                  />
                  <Input 
                    placeholder="e.g. 6.0" 
                    value={val} 
                    className="w-1/2"
                    onChange={(e) => updateEnglishReq(key, key, e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0" onClick={() => removeEnglishReq(key)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Offer Letter Fee</Label>
            <Input 
              value={form.offer_letter} 
              onChange={(e) => setForm(prev => ({ ...prev, offer_letter: e.target.value }))} 
              placeholder="e.g. Free, RM 250 Fees Applies" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Class Type</Label>
            <Input 
              value={form.class_type} 
              onChange={(e) => setForm(prev => ({ ...prev, class_type: e.target.value }))} 
              placeholder="e.g. Physical, Online, Blended" 
            />
          </div>
        </div>

        {/* Group 2: Course Fee Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Yearly Tuition Fees</Label>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-primary hover:bg-primary/10" onClick={() => setForm(p => ({ ...p, yearly_fees: [...p.yearly_fees, { year: "", fee: "" }] }))}>
                <Plus className="h-3 w-3 mr-1" /> Add Year
              </Button>
            </div>
            <div className="space-y-2">
              {form.yearly_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No yearly fees added.</p>}
              {form.yearly_fees.map((yf, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    placeholder="e.g. 1st Year" 
                    value={yf.year} 
                    onChange={(e) => {
                      const newArr = [...form.yearly_fees];
                      newArr[i].year = e.target.value;
                      setForm(prev => ({ ...prev, yearly_fees: newArr }));
                    }}
                  />
                  <Input 
                    placeholder="e.g. MYR 25,000" 
                    value={yf.fee} 
                    onChange={(e) => {
                      const newArr = [...form.yearly_fees];
                      newArr[i].fee = e.target.value;
                      setForm(prev => ({ ...prev, yearly_fees: newArr }));
                    }}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0 hover:bg-red-50" onClick={() => setForm(p => ({ ...p, yearly_fees: p.yearly_fees.filter((_, idx) => idx !== i) }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Other Fees</Label>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-primary hover:bg-primary/10" onClick={() => setForm(p => ({ ...p, other_fees: [...p.other_fees, { description: "", fee: "" }] }))}>
                <Plus className="h-3 w-3 mr-1" /> Add Fee
              </Button>
            </div>
            <div className="space-y-2">
              {form.other_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No other fees added.</p>}
              {form.other_fees.map((of, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    placeholder="e.g. EMGS Visa Fee" 
                    value={of.description} 
                    onChange={(e) => {
                      const newArr = [...form.other_fees];
                      newArr[i].description = e.target.value;
                      setForm(prev => ({ ...prev, other_fees: newArr }));
                    }}
                  />
                  <Input 
                    placeholder="e.g. MYR 2,500" 
                    value={of.fee} 
                    onChange={(e) => {
                      const newArr = [...form.other_fees];
                      newArr[i].fee = e.target.value;
                      setForm(prev => ({ ...prev, other_fees: newArr }));
                    }}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0 hover:bg-red-50" onClick={() => setForm(p => ({ ...p, other_fees: p.other_fees.filter((_, idx) => idx !== i) }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Group 3: Course Overview */}
        <div className="space-y-2 pt-4">
          <Label className="text-[13px] font-semibold text-gray-700">Course Overview (Rich Text)</Label>
          <div className="border rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[250px]">
            <ReactQuill 
              theme="snow" 
              value={form.overview} 
              onChange={(val) => setForm(prev => ({ ...prev, overview: val }))}
              className="bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Group 4: Entry Requirements */}
        <div className="space-y-2 pt-4">
          <Label className="text-[13px] font-semibold text-gray-700">Other Entry Requirements</Label>
          <Textarea 
            value={form.entry_requirements_text} 
            onChange={(e) => setForm(prev => ({ ...prev, entry_requirements_text: e.target.value }))} 
            placeholder="High school diploma, CGPA 3.0, etc..." 
            rows={4}
            className="bg-gray-50 rounded-xl resize-y"
          />
        </div>

        {/* Group 5: Career Opportunities */}
        <div className="space-y-2 pt-4">
          <Label className="text-[13px] font-semibold text-gray-700">Career Opportunities</Label>
          <div className="flex gap-2">
            <Input 
              value={newCareerTag}
              onChange={(e) => setNewCareerTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("career_outcomes", newCareerTag, setNewCareerTag))}
              placeholder="e.g. Software Engineer, Data Analyst"
            />
            <Button type="button" variant="secondary" onClick={() => addTag("career_outcomes", newCareerTag, setNewCareerTag)}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.career_outcomes.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full border border-green-200">
                {m} <button onClick={() => removeTag("career_outcomes", i)} className="font-bold ml-1 hover:text-green-900">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Group 6: Curriculum */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-[13px] font-semibold text-gray-700">Curriculum (By Year/Semester)</Label>
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-primary hover:bg-primary/10" onClick={() => setForm(p => ({ ...p, curriculum: [...p.curriculum, { year: \`Year \${p.curriculum.length + 1}\`, modules: [] }] }))}>
              <Plus className="h-3 w-3 mr-1" /> Add Year/Semester
            </Button>
          </div>
          
          <div className="space-y-4">
            {form.curriculum.length === 0 && <p className="text-xs text-muted-foreground italic">No curriculum added yet.</p>}
            {form.curriculum.map((curr, i) => (
              <div key={i} className="bg-gray-50/50 border rounded-xl p-4 space-y-3 relative group">
                <button 
                  onClick={() => setForm(p => ({ ...p, curriculum: p.curriculum.filter((_, idx) => idx !== i) }))}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <div>
                  <Label className="text-xs text-gray-500">Period Title</Label>
                  <Input 
                    value={curr.year} 
                    className="font-semibold text-gray-800 bg-white mt-1"
                    onChange={(e) => {
                      const newArr = [...form.curriculum];
                      newArr[i].year = e.target.value;
                      setForm(prev => ({ ...prev, curriculum: newArr }));
                    }}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-gray-500">Modules/Subjects</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => {
                      const newArr = [...form.curriculum];
                      newArr[i].modules.push("");
                      setForm(prev => ({ ...prev, curriculum: newArr }));
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Module
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {curr.modules.map((mod, j) => (
                      <div key={j} className="flex gap-2">
                        <Input 
                          placeholder="e.g. Introduction to Programming" 
                          value={mod} 
                          className="h-9 text-sm bg-white"
                          onChange={(e) => {
                            const newArr = [...form.curriculum];
                            newArr[i].modules[j] = e.target.value;
                            setForm(prev => ({ ...prev, curriculum: newArr }));
                          }}
                        />
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 shrink-0 bg-white border" onClick={() => {
                          const newArr = [...form.curriculum];
                          newArr[i].modules.splice(j, 1);
                          setForm(prev => ({ ...prev, curriculum: newArr }));
                        }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
`;

const file = 'src/pages/admin/AdminCourseForm.tsx';
const content = fs.readFileSync(file, 'utf8');

const regex = /<div className="p-6 md:p-8 space-y-12 overflow-y-auto">[\s\S]*\}\s*$/;
const newContent = content.replace(regex, replacement.trim() + "\n");

fs.writeFileSync(file, newContent);
console.log("Successfully rebuilt layout");
