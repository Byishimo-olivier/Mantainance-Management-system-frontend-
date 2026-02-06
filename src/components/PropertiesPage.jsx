import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode] = useState('cards'); // 'cards' or 'list'
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', tags: '', assetId: '' });
  const [assetForm, setAssetForm] = useState({ name: '', type: '', description: '', quantity: 1, building: '', block: '' });
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [checklistSelections, setChecklistSelections] = useState({});
  const [checklistDescription, setChecklistDescription] = useState('');
  const [isChecklistSubmitting, setIsChecklistSubmitting] = useState(false);
  const [showFloorMap, setShowFloorMap] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const navigate = useNavigate();
  const backendBase = 'http://localhost:5000';
  const itemsPerPage = 12;

  const setupAxiosAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const getImageUrl = useCallback(
    (path) => {
      if (!path) return '/default-property.png';
      try {
        // support arrays of photos
        if (Array.isArray(path) && path.length > 0) path = path[0];
        if (typeof path === 'string') {
          if (path.startsWith('http') || path.startsWith('//')) return path;
          if (path.startsWith('/')) return `${backendBase}${path}`;
          return path;
        }
        return '/default-property.png';
      } catch (e) {
        return '/default-property.png';
      }
    },
    [backendBase]
  );

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setupAxiosAuth();
      const response = await axios.get(`${backendBase}/api/properties`);
      let propertiesData = [];
      if (Array.isArray(response.data)) {
        propertiesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        propertiesData = response.data.data;
      } else if (response.data?.properties && Array.isArray(response.data.properties)) {
        propertiesData = response.data.properties;
      } else if (response.data) {
        propertiesData = [response.data];
      }
      setProperties(propertiesData);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendBase, setupAxiosAuth]);

  const fetchPropertyDetails = useCallback(
    async (property) => {
      if (!property) return;
      setSelectedProperty(property);
      setShowDetailsModal(true);
      setIsLoading(true);
      setError('');
      try {
        const propertyId = property.id || property._id;
        try {
          const issuesResponse = await axios.get(`${backendBase}/api/issues`);
          const allIssues = issuesResponse.data || [];
          const propertyIssues = allIssues.filter((issue) => {
            if (!issue) return false;
            const location = (issue.location || issue.address || '').toString().toLowerCase();
            const propertyName = (property.name || '').toLowerCase();
            const propertyAddress = (property.address || '').toLowerCase();
            return location.includes(propertyName) || location.includes(propertyAddress);
          });
          setIssues(propertyIssues);
        } catch (err) {
          console.error('Error loading issues:', err);
          setIssues([]);
        }

        try {
          const assetsResponse = await axios.get(`${backendBase}/api/assets?propertyId=${propertyId}`);
          setAssets(assetsResponse.data || []);
        } catch (err) {
          console.error('Error loading assets:', err);
          setAssets([]);
        }

        try {
          const techResponse = await axios.get(`${backendBase}/api/technicians/for-assignment`);
          setTechnicians(techResponse.data || []);
        } catch (err) {
          console.error('Error loading technicians:', err);
          setTechnicians([]);
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details.');
      } finally {
        setIsLoading(false);
      }
    },
    [backendBase]
  );

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        title: newIssue.title,
        description: newIssue.description,
        tags: newIssue.tags ? newIssue.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        location: selectedProperty.name,
        address: selectedProperty.address,
        assetId: newIssue.assetId || null,
        propertyId: selectedProperty.id || selectedProperty._id,
      };
      await axios.post(`${backendBase}/api/issues`, payload);
      await fetchPropertyDetails(selectedProperty);
      setNewIssue({ title: '', description: '', tags: '', assetId: '' });
      setSuccess('Issue created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating issue:', err);
      setError('Failed to create issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIssue = async (issueId, updates) => {
    try {
      await axios.put(`${backendBase}/api/issues/${issueId}`, updates);
      await fetchPropertyDetails(selectedProperty);
      setSuccess('Issue updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating issue:', err);
      setError('Failed to update issue.');
    }
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const propertyId = selectedProperty.id || selectedProperty._id;
      const assetData = { ...assetForm, propertyId };
      if (editingAsset) {
        const assetId = editingAsset.id || editingAsset._id;
        await axios.put(`${backendBase}/api/assets/${assetId}`, assetData);
        setSuccess('Asset updated successfully!');
      } else {
        await axios.post(`${backendBase}/api/assets`, assetData);
        setSuccess('Asset added successfully!');
      }
      const response = await axios.get(`${backendBase}/api/assets?propertyId=${propertyId}`);
      setAssets(response.data || []);
      setAssetForm({ name: '', type: '', description: '', quantity: 1, building: '', block: '' });
      setEditingAsset(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving asset:', err);
      setError(`Failed to save asset: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      const assetId = asset.id || asset._id;
      await axios.delete(`${backendBase}/api/assets/${assetId}`);
      setAssets((prev) => prev.filter((a) => (a.id || a._id) !== assetId));
      setSuccess('Asset deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting asset:', err);
      setError('Failed to delete asset.');
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const name = (property.name || '').toLowerCase();
      const address = (property.address || '').toLowerCase();
      const type = (property.type || '').toLowerCase();
      return name.includes(query) || address.includes(query) || type.includes(query);
    });
  }, [properties, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / itemsPerPage));
  const paginatedProperties = useMemo(() => {
    return filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredProperties, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const PropertyDetailsModal = () => {
    if (!selectedProperty || !showDetailsModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-start">
              <div className="md:col-span-1">
                <img
                  src={getImageUrl((Array.isArray(selectedProperty.photos) && selectedProperty.photos.length > 0) ? selectedProperty.photos[0] : (selectedProperty.image || selectedProperty.photo))}
                  alt={selectedProperty.name}
                  className="w-full h-56 md:h-64 object-cover rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProperty.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedProperty.address}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-500 hover:text-gray-700 ml-4"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{selectedProperty.type || 'Residential'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">{selectedProperty.price || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      {selectedProperty.forRent ? 'For Rent' : selectedProperty.forSale ? 'For Sale' : 'Available'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{selectedProperty.area ?? selectedProperty.sqft ?? '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Inspection Checklist</h3>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!checklistSelections['building']}
                    onChange={() => setChecklistSelections(s => ({ ...s, building: !s.building }))}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Building: {selectedProperty.name}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowFloorMap(s => !s)}
                  className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {showFloorMap ? 'Close Map' : 'Open Map'}
                </button>
              </div>

              {/* When the floor map is open we hide the default assets list.
                  Clicking a block will show assets for that block as cards inline. */}
              {!showFloorMap && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Assets</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assets && assets.length > 0 ? (
                      assets.map((a) => {
                        const aid = a.id || a._id;
                        return (
                          <label key={aid} className="flex items-center gap-3 p-2 border rounded">
                            <input
                              type="checkbox"
                              checked={!!checklistSelections[aid]}
                              onChange={() => setChecklistSelections(s => ({ ...s, [aid]: !s[aid] }))}
                              className="h-4 w-4"
                            />
                            <div className="text-sm">
                              <div className="font-medium">{a.name || aid}</div>
                              <div className="text-xs text-gray-500">{a.type || ''}</div>
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">No assets found for this property.</p>
                    )}
                  </div>
                </div>
              )}

              {showFloorMap && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Blocks / Zones</h4>
                  <div className="flex gap-6">
                    <div className="flex-1 bg-transparent rounded-2xl p-1 flex items-center justify-center">
                      <div className="relative w-full max-w-4xl h-96 rounded-xl bg-gray-700 p-6">
                        <div className="absolute inset-0 rounded-xl bg-gray-800 opacity-60"></div>

                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                          <div className="w-3/5 h-2/3 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="w-11/12 h-5/6 bg-[#c79a6b] rounded-md border-2 border-white flex items-center justify-center">
                              <div className="text-sm font-bold text-white truncate">{selectedProperty?.name || 'COURT'}</div>
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const positions = [
                            'absolute -top-6 left-1/2 transform -translate-x-1/2',
                            'absolute top-6 right-6',
                            'absolute bottom-6 right-6',
                            'absolute -bottom-6 left-1/2 transform -translate-x-1/2',
                            'absolute bottom-6 left-6',
                            'absolute top-6 left-6',
                            'absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-56',
                            'absolute right-6 top-1/2 transform -translate-y-1/2'
                          ];
                          const items = [];
                          const numBlocks = parseInt(selectedProperty.blocks) || 8;
                          for (let i = 1; i <= numBlocks; i++) {
                            const key = `block-${i}`;
                            const active = !!checklistSelections[key];
                            const pos = positions[(i - 1) % positions.length];
                            // If this block is selected, show asset cards for the block inline,
                            // otherwise show the block button.
                            if (selectedBlock === key) {
                              const blockAssets = (assets || []).filter((a) => {
                                const b = (a.block || a.zone || a.location || '').toString().toLowerCase();
                                return b.includes(String(i)) || b.includes(key) || b.includes(`block ${i}`);
                              });

                              items.push(
                                <div key={`${key}-panel`} className={`${pos} w-52 p-2 bg-white rounded shadow max-h-40 overflow-auto`}>
                                  <div className="text-xs font-semibold mb-2">Assets in {`Block ${i}`}</div>
                                  {blockAssets.length === 0 ? (
                                    <div className="text-xs text-gray-500">No assets for this block.</div>
                                  ) : (
                                    blockAssets.map((a) => {
                                      const aid = a.id || a._id;
                                      return (
                                        <div
                                          key={aid}
                                          onClick={() => setChecklistSelections(s => ({ ...s, [aid]: !s[aid] }))}
                                          className={`p-2 mb-2 rounded border cursor-pointer ${checklistSelections[aid] ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-800'}`}
                                        >
                                          <div className="text-sm font-medium">{a.name || aid}</div>
                                          <div className="text-xs text-gray-500">{a.type || ''}</div>
                                        </div>
                                      );
                                    })
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBlock(null)}
                                    className="mt-1 text-xs text-blue-600"
                                  >
                                    Close
                                  </button>
                                </div>
                              );
                            } else {
                              const displayNumber = i;
                              items.push(
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    // open the block to view assets
                                    setSelectedBlock(key === selectedBlock ? null : key);
                                  }}
                                  className={`${pos} w-28 h-20 rounded-lg shadow-md flex items-center justify-center border transition transform hover:-translate-y-0.5 ${active ? 'bg-green-600 text-white border-green-700' : 'bg-white text-gray-800 border-gray-200'}`}
                                >
                                  <div className="text-center">
                                    <div className="text-lg font-extrabold">{displayNumber}</div>
                                    <div className="text-xs text-gray-500">Block</div>
                                  </div>
                                </button>
                              );
                            }
                          }
                          return items;
                        })()}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              <div>
                <textarea
                  placeholder="Description for checklist items (optional)"
                  value={checklistDescription}
                  onChange={(e) => setChecklistDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="mt-3">
                <button
                  onClick={async () => {
                    // submit checklist: create one issue per selected item
                    const selections = Object.keys(checklistSelections).filter(k => checklistSelections[k]);
                    if (selections.length === 0) {
                      alert('Please select at least one item (building or assets)');
                      return;
                    }
                    setIsChecklistSubmitting(true);
                    try {
                      const propertyId = selectedProperty.id || selectedProperty._id;
                      const promises = selections.map(async (key) => {
                        const isBuilding = key === 'building';
                        const payload = {
                          title: isBuilding ? `Inspection - ${selectedProperty.name}` : `Inspection - ${ (assets.find(a => (a.id || a._id) === key) || {}).name || 'Asset' }`,
                          description: checklistDescription || `Inspection item for ${isBuilding ? 'building' : 'asset'}`,
                          tags: ['inspection'],
                          location: selectedProperty.name,
                          address: selectedProperty.address,
                          assetId: isBuilding ? null : key,
                          propertyId,
                        };
                        await axios.post(`${backendBase}/api/issues`, payload);
                      });

                      await Promise.all(promises);
                      await fetchPropertyDetails(selectedProperty);
                      setChecklistSelections({});
                      setChecklistDescription('');
                      setSuccess('Checklist issues created successfully');
                      setTimeout(() => setSuccess(''), 3000);
                    } catch (err) {
                      console.error('Failed submitting checklist', err);
                      setError('Failed to submit checklist.');
                    } finally {
                      setIsChecklistSubmitting(false);
                    }
                  }}
                  disabled={isChecklistSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isChecklistSubmitting ? 'Submitting...' : 'Create Issues from Checklist'}
                </button>
              </div>
            </div>

            {/* Tabs for Issues and Assets */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button className="py-2 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600">
                  Issues ({issues.length})
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
                  Assets ({assets.length})
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
                  Technicians ({technicians.length})
                </button>
              </nav>
            </div>

            {/* Issues List */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Recent Issues</h3>
              {issues.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No issues reported for this property</p>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 5).map((issue) => (
                    <div key={issue.id || issue._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{issue.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          {issue.tags && issue.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {issue.tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {issue.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Issue Form */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Report New Issue</h3>
              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Issue Title"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={newIssue.tags}
                    onChange={(e) => setNewIssue({...newIssue, tags: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Page header */}
      <div className="relative bg-gradient-to-b from-gray-800 to-transparent text-white">
        <div className="absolute inset-0 opacity-30 bg-[url('/hero-property.jpg')] bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="uppercase tracking-widest text-sm text-gray-200">Our exclusive properties</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold drop-shadow">All Properties</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Search + actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search properties by name, address, or type..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
             Business
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-gray-600">
          Showing {paginatedProperties.length} of {filteredProperties.length} properties
        </div>

        {/* Grid of property cards */}
        {isLoading && properties.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {paginatedProperties.map((property) => {
                const key = property.id || property._id || property.name;
                const img = getImageUrl((Array.isArray(property.photos) && property.photos.length > 0) ? property.photos[0] : (property.image || property.photo));
                const tag = property.forRent || property.rent ? 'RENT' : (property.forSale || property.sale ? 'BUY' : (property.type || 'BUY'));
                return (
                  <div
                    key={key}
                    onClick={() => fetchPropertyDetails(property)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition transform hover:-translate-y-1 hover:shadow-xl border border-gray-100"
                  >
                    <div className="relative h-44 bg-gray-200">
                      <img src={img} alt={property.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/default-property.png'; }} />
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">{tag}</span>
                      <div className="absolute top-3 right-3">
                        <button className="p-1 bg-white rounded-full shadow hover:bg-gray-100">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{property.name || 'Unnamed Property'}</h3>
                      <p className="text-sm text-gray-500 mt-1 truncate">{property.address}</p>
                      {property.price && (
                        <div className="mt-4 text-lg font-extrabold text-gray-900">{property.price}</div>
                      )}

                      <div className="mt-6 border-t pt-4 text-gray-600 text-xs">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <div className="text-gray-400 mb-1">Beds</div>
                            <div className="font-bold">{property.beds ?? 4}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Wash Room</div>
                            <div className="font-bold">{property.baths ?? 2}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Levels</div>
                            <div className="font-bold">{property.levels ?? property.floors ?? 2}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Area</div>
                              <div className="font-bold">{property.area ?? property.sqft ?? '1234'}</div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-4 gap-2 items-center">
                          <div>
                            <div className="text-gray-400 mb-1">Floors</div>
                            <div className="font-bold">{property.floors ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Blocks</div>
                            <div className="font-bold">{property.blocks ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">Rooms</div>
                            <div className="font-bold">{property.rooms ?? '-'}</div>
                          </div>
                          <div className="flex items-center justify-center">
                            {/* <button
                              onClick={(e) => { e.stopPropagation(); fetchPropertyDetails(property); }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                              View Details
                            </button> */}
                          </div>
                        </div>
                        {/* thumbnails removed — main image uses photos[0] above */}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchPropertyDetails(property);
                        }}
                        className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No results message */}
            {filteredProperties.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {filteredProperties.length > itemsPerPage && (
          <div className="flex items-center justify-center mt-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal />
    </div>
  );
}

export default PropertiesPage;