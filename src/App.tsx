import React, { useState, useEffect, useRef } from 'react';
    import { Save, Pencil, Trash2, Plus, X, Upload, Download, Copy } from 'lucide-react';

    interface PersonalData {
      id: number;
      name: string;
      email: string;
      phone: string;
      address: string;
      birthDate: string;
      occupation: string;
      [key: string]: any;
    }

    function App() {
      const [formData, setFormData] = useState<PersonalData>({
        id: Date.now(),
        name: '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        occupation: ''
      });

      const [records, setRecords] = useState<PersonalData[]>([]);
      const [editMode, setEditMode] = useState<boolean>(false);
      const fileInputRef = useRef<HTMLInputElement>(null);
      const [extraFields, setExtraFields] = useState<string[]>([]);
      const [newFieldName, setNewFieldName] = useState('');
      const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date'>('text');

      useEffect(() => {
        const savedRecords = localStorage.getItem('personalRecords');
        if (savedRecords) {
          setRecords(JSON.parse(savedRecords));
        }
      }, []);

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode) {
          setRecords(records.map(record => 
            record.id === formData.id ? formData : record
          ));
          setEditMode(false);
        } else {
          setRecords([...records, { ...formData, id: Date.now() }]);
        }
        localStorage.setItem('personalRecords', JSON.stringify(records));
        setFormData({
          id: Date.now(),
          name: '',
          email: '',
          phone: '',
          address: '',
          birthDate: '',
          occupation: ''
        });
      };

      const handleSaveAsNew = (e: React.FormEvent) => {
        e.preventDefault();
        const newRecord = { ...formData, id: Date.now() };
        setRecords([...records, newRecord]);
        localStorage.setItem('personalRecords', JSON.stringify([...records, newRecord]));
        setFormData({
          id: Date.now(),
          name: '',
          email: '',
          phone: '',
          address: '',
          birthDate: '',
          occupation: ''
        });
        setEditMode(false);
      };

      const handleEdit = (record: PersonalData) => {
        setFormData(record);
        setEditMode(true);
      };

      const handleDelete = (id: number) => {
        const updatedRecords = records.filter(record => record.id !== id);
        setRecords(updatedRecords);
        localStorage.setItem('personalRecords', JSON.stringify(updatedRecords));
      };

      const handleSaveToFile = () => {
        let textContent = 'PERSONAL RECORDS\n\n';
        records.forEach((record, index) => {
          textContent += `Record ${index + 1}:\n`;
          textContent += `Name: ${record.name}\n`;
          textContent += `Email: ${record.email}\n`;
          textContent += `Phone: ${record.phone}\n`;
          textContent += `Address: ${record.address}\n`;
          textContent += `Birth Date: ${record.birthDate}\n`;
          textContent += `Occupation: ${record.occupation}\n`;
          extraFields.forEach(field => {
            textContent += `${field}: ${record[field]}\n`;
          });
          textContent += '\n';
        });

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'personal_records.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      const handleLoadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const lines = content.split('\n');
              const loadedRecords: PersonalData[] = [];
              let currentRecord: Partial<PersonalData> = {};
              let currentField: string | null = null;
              
              lines.forEach(line => {
                if (line.startsWith('Name: ')) currentRecord.name = line.replace('Name: ', '');
                else if (line.startsWith('Email: ')) currentRecord.email = line.replace('Email: ', '');
                else if (line.startsWith('Phone: ')) currentRecord.phone = line.replace('Phone: ', '');
                else if (line.startsWith('Address: ')) currentRecord.address = line.replace('Address: ', '');
                else if (line.startsWith('Birth Date: ')) currentRecord.birthDate = line.replace('Birth Date: ', '');
                else if (line.startsWith('Occupation: ')) {
                  currentRecord.occupation = line.replace('Occupation: ', '');
                  currentField = null;
                } else if (line.includes(': ')) {
                  const [key, value] = line.split(': ').map(part => part.trim());
                  if (extraFields.includes(key)) {
                    currentRecord[key] = value;
                    currentField = key;
                  }
                } else if (line.trim() === '') {
                  if (Object.keys(currentRecord).length >= 6) {
                    loadedRecords.push({
                      id: Date.now() + loadedRecords.length,
                      ...currentRecord as Omit<PersonalData, 'id'>
                    });
                    currentRecord = {};
                  }
                }
              });
              
              setRecords(loadedRecords);
              localStorage.setItem('personalRecords', JSON.stringify(loadedRecords));
            } catch (error) {
              alert('Error loading file. Please make sure it\'s a valid records file.');
            }
          };
          reader.readAsText(file);
        }
      };

      const handleAddField = () => {
        if (newFieldName.trim() !== '' && !extraFields.includes(newFieldName.trim())) {
          setExtraFields([...extraFields, newFieldName.trim()]);
          setNewFieldName('');
        }
      };

      const handleRemoveField = (fieldToRemove: string) => {
        setExtraFields(extraFields.filter(field => field !== fieldToRemove));
      };

      const handleAddFieldWithSelect = () => {
        if (newFieldName.trim() !== '' && !extraFields.includes(newFieldName.trim())) {
          setExtraFields([...extraFields, newFieldName.trim()]);
          setNewFieldName('');
        }
      };

      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex gap-8">
          <div className="w-1/2">
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleSaveToFile}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
              >
                <Download size={20} />
                Save to File
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
              >
                <Upload size={20} />
                Load from File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleLoadFromFile}
                className="hidden"
              />
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">
                {editMode ? 'Edit Personal Data' : 'Personal Data Form'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                {extraFields.map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1">{field}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData[field] || ''}
                        onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                        className="flex-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="New field name"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as 'text' | 'number' | 'date')}
                    className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddFieldWithSelect}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                  >
                    <Plus size={20} />
                    Add Field
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save size={20} />
                    {editMode ? 'Update' : 'Save'}
                  </button>
                  
                  {editMode && (
                    <button
                      onClick={handleSaveAsNew}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <Copy size={20} />
                      Save as New
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="w-1/2">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Records</h2>
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{record.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>Email: {record.email}</p>
                      <p>Phone: {record.phone}</p>
                      <p>Address: {record.address}</p>
                      <p>Birth Date: {record.birthDate}</p>
                      <p>Occupation: {record.occupation}</p>
                      {extraFields.map(field => (
                        <p key={field}>{field}: {record[field]}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    export default App;
