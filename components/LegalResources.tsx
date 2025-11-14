import React, { useState, useMemo } from 'react';

// Update resource interface to include category
interface Resource {
    name: string;
    url: string;
    category: string;
}

const initialResources: Resource[] = [
    { name: 'UCC Article 3 - Negotiable Instruments', url: 'https://www.law.cornell.edu/ucc/3', category: 'UCC' },
    { name: 'UCC Article 9 - Secured Transactions', url: 'https://www.law.cornell.edu/ucc/9', category: 'UCC' },
    { name: 'Fair Credit Reporting Act (FCRA) - FTC', url: 'https://www.ftc.gov/legal-library/browse/statutes/fair-credit-reporting-act', category: 'Statutes' },
    { name: 'Fair Debt Collection Practices Act (FDCPA) - FTC', url: 'https://www.ftc.gov/legal-library/browse/statutes/fair-debt-collection-practices-act', category: 'Statutes' },
    { name: 'Truth in Lending Act (TILA) - CFPB', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/', category: 'Statutes' },
    { name: 'Black\'s Law Dictionary 4th Edition', url: 'https://archive.org/details/blackslawdiction00blac', category: 'Reference' },
];

const LegalResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [searchTerm, setSearchTerm] = useState('');
  const [newResource, setNewResource] = useState({ name: '', url: '', category: '' });

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResource.name && newResource.url && newResource.category) {
      setResources([...resources, newResource]);
      setNewResource({ name: '', url: '', category: '' }); // Reset form
    }
  };

  const handleNewResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewResource(prev => ({ ...prev, [name]: value }));
  };

  const filteredResources = useMemo(() => {
    return resources.filter(resource =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, searchTerm]);
  
  const groupedResources = useMemo(() => {
      return filteredResources.reduce((acc, resource) => {
        const category = resource.category.trim() || 'Uncategorized';
        (acc[category] = acc[category] || []).push(resource);
        return acc;
      }, {} as Record<string, Resource[]>);
  }, [filteredResources]);


  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center">Legal Resources</h3>
      <p className="text-slate-600 mb-6 text-center">
        Search, browse, and add to a curated list of commentary and case law relevant to financial sovereignty.
      </p>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search resources by name, category, or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-400 focus:outline-none transition-shadow"
          aria-label="Search Legal Resources"
        />
      </div>

      {/* Add New Resource Form */}
      <div className="max-w-2xl mx-auto mb-10 p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="text-lg font-bold mb-4">Add a New Resource</h4>
          <form onSubmit={handleAddResource} className="space-y-4">
              <input
                  type="text"
                  name="name"
                  placeholder="Resource Name"
                  value={newResource.name}
                  onChange={handleNewResourceChange}
                  required
                  className="w-full p-2 border border-slate-300 rounded-md"
                  aria-label="New Resource Name"
              />
              <input
                  type="url"
                  name="url"
                  placeholder="https://example.com"
                  value={newResource.url}
                  onChange={handleNewResourceChange}
                  required
                  className="w-full p-2 border border-slate-300 rounded-md"
                  aria-label="New Resource URL"
              />
              <input
                  type="text"
                  name="category"
                  placeholder="Category (e.g., UCC, Statutes)"
                  value={newResource.category}
                  onChange={handleNewResourceChange}
                  required
                  className="w-full p-2 border border-slate-300 rounded-md"
                  aria-label="New Resource Category"
              />
              <button
                  type="submit"
                  className="w-full bg-[#1E2A3A] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#3c5472] transition-colors disabled:bg-slate-400"
              >
                  Add Resource
              </button>
          </form>
      </div>

      {/* Display Resources */}
      <div className="space-y-8 max-w-2xl mx-auto">
        {Object.keys(groupedResources).length > 0 ? (
          Object.entries(groupedResources).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
            <div key={category}>
                <h4 className="text-lg font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-200">{category}</h4>
                <div className="space-y-4">
                    {items.map((resource, index) => (
                        <a 
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all duration-200"
                        >
                            <p className="font-semibold text-blue-700">{resource.name}</p>
                            <p className="text-sm text-slate-500 break-all">{resource.url}</p>
                        </a>
                    ))}
                </div>
            </div>
          ))
        ) : (
            <div className="text-center p-8 bg-slate-50 rounded-lg">
                <p className="text-slate-600">No resources found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LegalResources;
