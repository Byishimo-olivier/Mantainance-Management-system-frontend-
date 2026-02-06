import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewIssue from './NewIssue';

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode] = useState('cards');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', tags: '', assetId: '' });
  const [assetForm, setAssetForm] = useState({ name: '', type: '', description: '', quantity: 1, building: '', block: '' });
  const [editingAsset, setEditingAsset] = useState(null);
  const [originalAssetBlocks, setOriginalAssetBlocks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [checklistSelections, setChecklistSelections] = useState({});
  const [checklistDescription, setChecklistDescription] = useState('');
  const [isChecklistSubmitting, setIsChecklistSubmitting] = useState(false);
  const [showFloorMap, setShowFloorMap] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [detailsTab, setDetailsTab] = useState('issues');
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [newIssueModel, setNewIssueModel] = useState(null);

  // Lock background scrolling when new-issue modal is open
  useEffect(() => {
    if (showNewIssueModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [showNewIssueModal]);

  const navigate = useNavigate();
  const backendBase = 'http://localhost:5000';
  const itemsPerPage = 12;

  // Block configuration
  const [blockConfiguration, setBlockConfiguration] = useState({
    blocks: [
      { id: '101', name: 'Block 101', type: 'regular', status: 'available', seats: 50, vipSeats: 5 },
      { id: '102', name: 'Block 102', type: 'regular', status: 'available', seats: 50, vipSeats: 5 },
      { id: '103', name: 'Block 103', type: 'regular', status: 'available', seats: 60, vipSeats: 8 },
      { id: '104', name: 'Block 104', type: 'vip', status: 'available', seats: 40, vipSeats: 40 },
      { id: '105', name: 'Block 105', type: 'vip', status: 'available', seats: 40, vipSeats: 40 },
      { id: '106', name: 'Block 106', type: 'vip', status: 'available', seats: 40, vipSeats: 40 },
      { id: '107', name: 'Block 107', type: 'regular', status: 'unavailable', seats: 50, vipSeats: 5 },
      { id: '108', name: 'Block 108', type: 'regular', status: 'sold-out', seats: 50, vipSeats: 5 },
    ],
    highlightedBlocks: ['101', '102', '103'],
    selectedBlocks: []
  });

  // Seat configuration for each block (fallback if no assets)
  const [seatConfiguration, setSeatConfiguration] = useState({
    rows: 10,
    seatsPerRow: 8,
    vipRows: [0, 1, 2],
    unavailableSeats: ['0-5', '0-6', '0-7', '1-8', '1-9', '2-10', '2-11'],
    soldOutSeats: ['5-10', '5-11', '5-12', '6-8', '6-9'],
    selectedSeats: []
  });

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
      setError('Failed to load properties.');
    } finally {
      setIsLoading(false);
    }
  }, [backendBase]);

  const fetchPropertyDetails = useCallback(async (property) => {
    try {
      setSelectedProperty(property);
      setShowDetailsModal(true);
      setError('');
      
      const propertyId = property.id || property._id;

      // Fetch issues
      try {
        const issuesResponse = await axios.get(`${backendBase}/api/issues?propertyId=${propertyId}`);
        setIssues(Array.isArray(issuesResponse.data) ? issuesResponse.data : []);
      } catch (err) {
        console.error('Error loading issues:', err);
        setIssues([]);
      }

      // Fetch assets and attach only those assigned to this property
      try {
        const assetsResponse = await axios.get(`${backendBase}/api/assets?propertyId=${propertyId}`);
        const allAssets = Array.isArray(assetsResponse.data) ? assetsResponse.data : [];
        const filteredAssets = (allAssets || []).filter((a) => {
          const pid = a.propertyId || (a.property && (a.property.id || a.property._id));
          if (pid && String(pid) === String(propertyId)) return true;
          if (a.location && typeof a.location === 'object') {
            if (a.location.propertyId && String(a.location.propertyId) === String(propertyId)) return true;
            if (a.location.property && String(a.location.property) === String(propertyId)) return true;
          }
          const propName = (property?.name || '').toLowerCase();
          const propAddr = (property?.address || '').toLowerCase();
          const locStr = (a.location && (typeof a.location === 'string' ? a.location : JSON.stringify(a.location))) || '';
          const locLower = locStr.toLowerCase();
          if (propName && locLower.includes(propName)) return true;
          if (propAddr && locLower.includes(propAddr)) return true;
          return false;
        });
        setAssets(filteredAssets);
        setSelectedProperty((prev) => ({ ...(prev || property), assets: filteredAssets }));
      } catch (err) {
        console.error('Error loading assets:', err);
        setAssets([]);
        setSelectedProperty((prev) => ({ ...(prev || property), assets: [] }));
      }

      // Fetch technicians (non-fatal)
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
    }
  }, [backendBase]);

  const getAssetLocationInfo = useCallback((asset) => {
    let building = '';
    let blocks = [];
    try {
      if (!asset) return { building: '', blocks: [] };
      if (asset.building) building = asset.building;
      if (asset.block) {
        if (Array.isArray(asset.block)) blocks = asset.block.map(String);
        else blocks = asset.block.toString().split(/[;,|]/).map(s => s.trim()).filter(Boolean);
      }
      if (asset.zone && blocks.length === 0) {
        if (Array.isArray(asset.zone)) blocks = asset.zone.map(String);
        else blocks = asset.zone.toString().split(/[;,|]/).map(s => s.trim()).filter(Boolean);
      }
      const loc = asset.location;
      if (loc) {
        if (typeof loc === 'string') {
          try {
            const parsed = JSON.parse(loc);
            if (parsed) {
              building = building || parsed.building || parsed.buildingName || '';
              if (!blocks.length && parsed.block) {
                if (Array.isArray(parsed.block)) blocks = parsed.block.map(String);
                else blocks = parsed.block.toString().split(/[;,|]/).map(s => s.trim()).filter(Boolean);
              }
              if (!blocks.length && parsed.zone) {
                if (Array.isArray(parsed.zone)) blocks = parsed.zone.map(String);
                else blocks = parsed.zone.toString().split(/[;,|]/).map(s => s.trim()).filter(Boolean);
              }
            }
          } catch (e) {
            const str = loc.toLowerCase();
            const matches = str.match(/\d+/g);
            if (matches && matches.length) {
              blocks = matches.map(String);
            }
          }
        } else if (typeof loc === 'object') {
          building = building || loc.building || loc.buildingName || '';
          if (!blocks.length && loc.block) {
            if (Array.isArray(loc.block)) blocks = loc.block.map(String);
            else blocks = loc.block.toString().split(/[;,|]/).map(s => s.trim()).filter(Boolean);
          }
          if (!blocks.length && loc.zone) {
            if (Array.isArray(loc.zone)) blocks = loc.zone.map(String);
            else blocks = loc.zone.toString().split(/[;,|]/).map(s => s.trim()).filter(Boolean);
          }
        }
      }
    } catch (e) {
      // ignore
    }
    blocks = blocks.map(b => b.toString());
    return { building: (building || '').toString(), blocks };
  }, []);

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
        const prev = Array.isArray(originalAssetBlocks) ? originalAssetBlocks.map(String) : [];
        const now = Array.isArray(assetForm.blocks) ? assetForm.blocks.map(String) : [];
        const remove = prev.filter(p => !now.includes(p));
        if (remove.length > 0) assetData.removeBlocks = remove;
      }
      if (editingAsset) {
        const assetId = editingAsset.id || editingAsset._id;
        await axios.put(`${backendBase}/api/assets/${assetId}`, assetData);
        setSuccess('Asset updated successfully!');
      } else {
        await axios.post(`${backendBase}/api/assets`, assetData);
        setSuccess('Asset added successfully!');
      }
      const response = await axios.get(`${backendBase}/api/assets?propertyId=${propertyId}`);
      const allAssets = response.data || [];
      const filteredAssets = (allAssets || []).filter((a) => {
        const pid = a.propertyId || (a.property && (a.property.id || a.property._id));
        if (pid && String(pid) === String(propertyId)) return true;
        if (a.location && typeof a.location === 'object') {
          if (a.location.propertyId && String(a.location.propertyId) === String(propertyId)) return true;
          if (a.location.property && String(a.location.property) === String(propertyId)) return true;
        }
        const propName = (selectedProperty?.name || '').toLowerCase();
        const propAddr = (selectedProperty?.address || '').toLowerCase();
        const locStr = (a.location && (typeof a.location === 'string' ? a.location : JSON.stringify(a.location))) || '';
        const locLower = locStr.toLowerCase();
        if (propName && locLower.includes(propName)) return true;
        if (propAddr && locLower.includes(propAddr)) return true;
        return false;
      });
      setAssets(filteredAssets);
      setAssetForm({ name: '', type: '', description: '', quantity: 1, building: '', blocks: [] });
      setOriginalAssetBlocks([]);
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

  // Block selection functions
  const handleBlockClick = (blockId) => {
    // try to find block in configuration; if not found, allow interaction using a safe default
    const block = blockConfiguration.blocks.find(b => String(b.id) === String(blockId)) || { id: blockId, status: 'available', name: `Block ${blockId}`, type: 'regular' };

    if (block.status === 'unavailable' || block.status === 'sold-out') {
      return;
    }

    // Set the selected block to show seats for this block
    setSelectedBlock(String(blockId));
  };

  const getBlockStatus = (blockId) => {
    const block = blockConfiguration.blocks.find(b => b.id === blockId);
    return block?.status || 'available';
  };

  const isBlockSelected = (blockId) => {
    return blockConfiguration.selectedBlocks.includes(blockId);
  };

  const isBlockHighlighted = (blockId) => {
    return blockConfiguration.highlightedBlocks.includes(blockId);
  };

  // Get assets for the selected block
  const getAssetsForSelectedBlock = useMemo(() => {
    if (!selectedBlock) return [];
    
    return assets.filter((a) => {
      const info = getAssetLocationInfo(a);
      const blocks = info.blocks || [];
      
      // Check if asset belongs to selected block
      return blocks.some(b => String(b) === String(selectedBlock));
    });
  }, [assets, selectedBlock, getAssetLocationInfo]);

  // Seat/Asset selection functions
  const handleAssetSelection = (assetId, index) => {
    if (!selectedBlock) return;
    
    const assetKey = `${assetId}-${index}`;
    
    setSelectedSeats(prev => {
      const newSelectedSeats = { ...prev };
      if (newSelectedSeats[assetKey]) {
        delete newSelectedSeats[assetKey];
      } else {
        const asset = assets.find(a => (a.id || a._id) === assetId);
        newSelectedSeats[assetKey] = {
          blockId: selectedBlock,
          assetId: assetId,
          assetName: asset?.name || `Asset ${assetId}`,
          assetType: asset?.type || '',
          index: index,
          isSelected: true
        };
      }
      return newSelectedSeats;
    });
  };

  // Handle selecting all assets of a type
  const handleSelectAllAssets = (assetId) => {
    if (!selectedBlock) return;
    
    const asset = assets.find(a => (a.id || a._id) === assetId);
    if (!asset) return;
    
    const qty = asset.quantity ?? 1;
    const newSelections = {};
    
    for (let i = 0; i < qty; i++) {
      const assetKey = `${assetId}-${i}`;
      newSelections[assetKey] = {
        blockId: selectedBlock,
        assetId: assetId,
        assetName: asset?.name || `Asset ${assetId}`,
        assetType: asset?.type || '',
        index: i,
        isSelected: true
      };
    }
    
    setSelectedSeats(prev => ({ ...prev, ...newSelections }));
  };

  // Handle deselecting all assets of a type
  const handleDeselectAllAssets = (assetId) => {
    const newSelections = { ...selectedSeats };
    Object.keys(newSelections).forEach(key => {
      if (key.startsWith(`${assetId}-`)) {
        delete newSelections[key];
      }
    });
    setSelectedSeats(newSelections);
  };

  // Check if an asset instance is selected
  const isAssetInstanceSelected = (assetId, index) => {
    return !!selectedSeats[`${assetId}-${index}`];
  };

  // Check if all instances of an asset are selected
  const areAllAssetsSelected = (assetId) => {
    const asset = assets.find(a => (a.id || a._id) === assetId);
    if (!asset) return false;
    
    const qty = asset.quantity ?? 1;
    let selectedCount = 0;
    
    for (let i = 0; i < qty; i++) {
      if (selectedSeats[`${assetId}-${i}`]) {
        selectedCount++;
      }
    }
    
    return selectedCount === qty;
  };

  const renderAssetSeats = () => {
    const blockAssets = getAssetsForSelectedBlock;
    
    if (blockAssets.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No assets assigned to this block</div>
          <div className="text-sm text-gray-400">Add assets to this block in the Assets tab</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {blockAssets.map((asset) => {
          const aid = asset.id || asset._id;
          const qty = asset.quantity ?? 1;
          const allSelected = areAllAssetsSelected(aid);
          
          return (
            <div key={aid} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-800">{asset.name}</div>
                  <div className="text-sm text-gray-500">{asset.type || 'Asset'}</div>
                  {asset.description && (
                    <div className="text-xs text-gray-400 mt-1">{asset.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Available: {qty}
                  </div>
                  <button
                    onClick={() => allSelected ? handleDeselectAllAssets(aid) : handleSelectAllAssets(aid)}
                    className={`px-3 py-1 text-sm rounded ${allSelected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {Array.from({ length: qty }).map((_, index) => {
                  const isSelected = isAssetInstanceSelected(aid, index);
                  const assetKey = `${aid}-${index}`;
                  
                  return (
                    <button
                      key={assetKey}
                      onClick={() => handleAssetSelection(aid, index)}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs mt-1 opacity-75">#{index + 1}</div>
                      <div className={`w-3 h-3 rounded-full mt-2 ${isSelected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-3 text-xs text-gray-500 flex justify-between">
                <span>Click on individual items to select/deselect</span>
                <span className={`font-medium ${allSelected ? 'text-green-600' : 'text-gray-600'}`}>
                  Selected: {Object.keys(selectedSeats).filter(k => k.startsWith(`${aid}-`)).length} / {qty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Fallback: original seating chart grid (when no assets)
  const renderFallbackSeatingChart = () => {
    const rows = [];
    const block = blockConfiguration.blocks.find(b => b.id === selectedBlock);
    
    for (let row = 0; row < seatConfiguration.rows; row++) {
      const seats = [];
      for (let seat = 0; seat < seatConfiguration.seatsPerRow; seat++) {
        const seatKey = `${row}-${seat}`;
        const seatId = `${selectedBlock}-${row}-${seat}`;
        const isSelected = !!selectedSeats[seatId];
        const isVIP = seatConfiguration.vipRows.includes(row);
        const isUnavailable = seatConfiguration.unavailableSeats.includes(seatKey);
        const isSoldOut = seatConfiguration.soldOutSeats.includes(seatKey);
        
        let seatClass = "w-8 h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all ";
        
        if (isSelected) {
          seatClass += "bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700";
        } else if (isUnavailable) {
          seatClass += "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400";
        } else if (isSoldOut) {
          seatClass += "bg-red-500 text-white cursor-not-allowed border border-red-600";
        } else if (isVIP) {
          seatClass += "bg-orange-500 text-white border-2 border-orange-600 hover:bg-orange-600";
        } else {
          seatClass += "bg-green-500 text-white border-2 border-green-600 hover:bg-green-600";
        }
        
        seats.push(
          <button
            key={seatKey}
            onClick={() => {
              if (!isUnavailable && !isSoldOut) {
                setSelectedSeats(prev => {
                  const newSelectedSeats = { ...prev };
                  if (newSelectedSeats[seatId]) {
                    delete newSelectedSeats[seatId];
                  } else {
                    newSelectedSeats[seatId] = {
                      blockId: selectedBlock,
                      row: row,
                      seat: seat,
                      isVIP: isVIP,
                      isSelected: true
                    };
                  }
                  return newSelectedSeats;
                });
              }
            }}
            disabled={isUnavailable || isSoldOut}
            className={seatClass}
            title={`${block?.name || selectedBlock} - Row ${row + 1}, Seat ${seat + 1}${isVIP ? ' (VIP)' : ''}`}
          >
            {seat + 1}
          </button>
        );
      }
      
      rows.push(
        <div key={row} className="flex items-center gap-2 mb-2">
          <div className="w-12 text-sm font-medium text-gray-600">Row {row + 1}</div>
          <div className="flex gap-1 flex-wrap">
            {seats}
          </div>
        </div>
      );
    }
    
    return rows;
  };

  const renderBlockMap = () => {
    // derive which blocks to show: prefer selectedProperty.blocks when available
    let blocksToShow = [];
    try {
      const spb = selectedProperty?.blocks;
      if (spb) {
        let ids = [];
        if (Array.isArray(spb)) ids = spb.map(String).map(s => s.trim()).filter(Boolean);
        else if (typeof spb === 'string' && spb.trim()) ids = spb.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
        else if (typeof spb === 'number' && Number.isFinite(spb) && spb > 0) ids = Array.from({ length: spb }, (_, k) => String(k + 1));
        blocksToShow = ids.map(id => {
          const found = blockConfiguration.blocks.find(b => String(b.id) === String(id));
          if (found) return found;
          return { id, name: `Block ${id}`, type: 'regular', status: 'available', seats: 0, vipSeats: 0 };
        });
      }
    } catch (e) {
      blocksToShow = [];
    }
    if (!blocksToShow || blocksToShow.length === 0) blocksToShow = blockConfiguration.blocks;

    return (
      <div className="relative w-full max-w-3xl mx-auto">
        {/* Main Court Area */}
        <div className="relative mb-8">
          <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-4/5 h-3/5 bg-amber-700 rounded-md border-4 border-amber-800 flex items-center justify-center">
              <div className="text-xl font-bold text-white">{selectedProperty?.name || 'MAIN COURT'}</div>
            </div>
          </div>
          
          {/* Blocks around the court */}
          <div className="absolute inset-0">
            {/* Top blocks */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              {blocksToShow.slice(0, 3).map(block => (
                <BlockButton 
                  key={block.id}
                  block={block}
                  onClick={() => handleBlockClick(block.id)}
                  isSelected={isBlockSelected(block.id)}
                  isHighlighted={isBlockHighlighted(block.id)}
                />
              ))}
            </div>
            
            {/* Right blocks */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-4">
              {blocksToShow.slice(3, 5).map(block => (
                <BlockButton 
                  key={block.id}
                  block={block}
                  onClick={() => handleBlockClick(block.id)}
                  isSelected={isBlockSelected(block.id)}
                  isHighlighted={isBlockHighlighted(block.id)}
                  orientation="vertical"
                />
              ))}
            </div>
            
            {/* Left blocks */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex flex-col gap-4">
              {blocksToShow.slice(5, 7).map(block => (
                <BlockButton 
                  key={block.id}
                  block={block}
                  onClick={() => handleBlockClick(block.id)}
                  isSelected={isBlockSelected(block.id)}
                  isHighlighted={isBlockHighlighted(block.id)}
                  orientation="vertical"
                />
              ))}
            </div>
            
            {/* Bottom blocks */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              {blocksToShow.slice(7).map(block => (
                <BlockButton 
                  key={block.id}
                  block={block}
                  onClick={() => handleBlockClick(block.id)}
                  isSelected={isBlockSelected(block.id)}
                  isHighlighted={isBlockHighlighted(block.id)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend removed per request */}
      </div>
    );
  };

  const BlockButton = ({ block, onClick, isSelected, isHighlighted, orientation = 'horizontal' }) => {
    let blockClass = "flex items-center justify-center font-bold rounded-lg shadow-md transition-all hover:scale-105 ";
    
    if (block.status === 'unavailable') {
      blockClass += "bg-gray-400 text-gray-600 border-2 border-gray-500 cursor-not-allowed";
    } else if (block.status === 'sold-out') {
      blockClass += "bg-red-500 text-white border-2 border-red-600 cursor-not-allowed";
    } else if (isSelected) {
      blockClass += "bg-blue-600 text-white border-2 border-blue-700";
    } else if (isHighlighted) {
      blockClass += "bg-yellow-400 text-gray-800 border-2 border-yellow-500";
    } else if (block.type === 'vip') {
      blockClass += "bg-orange-500 text-white border-2 border-orange-600";
    } else {
      blockClass += "bg-green-500 text-white border-2 border-green-600";
    }
    
    if (orientation === 'vertical') {
      blockClass += " w-16 h-24";
    } else {
      blockClass += " w-24 h-16";
    }
    
    return (
      <button
        onClick={() => onClick(block.id)}
        disabled={block.status === 'unavailable' || block.status === 'sold-out'}
        className={blockClass}
        title={`${block.name} - ${block.seats} seats (${block.vipSeats} VIP)`}
      >
        <div className="text-center">
          <div className="text-lg font-extrabold">{block.id}</div>
          <div className="text-xs opacity-90">{block.type === 'vip' ? 'VIP' : 'Block'}</div>
        </div>
      </button>
    );
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
                    checked={!!(checklistSelections['building'] > 0)}
                    onChange={() => setChecklistSelections(s => ({ ...s, building: s.building > 0 ? 0 : 1 }))}
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
                              checked={!!(checklistSelections[aid] > 0)}
                              onChange={() => setChecklistSelections(s => ({ ...s, [aid]: s[aid] > 0 ? 0 : 1 }))}
                              className="h-4 w-4"
                            />
                            <div className="text-sm">
                              <div className="font-medium">{a.name || aid}</div>
                              <div className="text-xs text-gray-500">{a.type || ''}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {(() => {
                                  const info = getAssetLocationInfo(a);
                                  const blocks = (info.blocks || []).filter(Boolean);
                                  return `${info.building ? info.building + ' · ' : ''}${blocks.length ? (blocks.length === 1 ? 'Block ' + blocks[0] : 'Blocks ' + blocks.join(', ')) : ''}`;
                                })()}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">Available: {a.quantity ?? 1}{checklistSelections[aid] > 0 ? ` · Selected: ${checklistSelections[aid]}` : ''}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setChecklistSelections(s => { const cur = s[aid] || 0; const max = a.quantity || 1; const next = cur >= max ? 0 : cur + 1; return { ...s, [aid]: next }; }); }}
                                  className="px-2 py-1 bg-gray-100 rounded text-xs"
                                >
                                  {checklistSelections[aid] > 0 ? (checklistSelections[aid] === (a.quantity || 1) ? 'Deselect' : '+') : 'Select'}
                                </button>
                                { (checklistSelections[aid] > 0) && (
                                  <div className="text-xs text-gray-600">{checklistSelections[aid]} / {a.quantity ?? 1}</div>
                                ) }
                              </div>
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
                <div className="mb-6">
                  {/* Step 1: Block Selection (if no block selected) */}
                  {!selectedBlock ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Select a Block</h4>
                        <button
                          onClick={() => setShowFloorMap(false)}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          ← Back to Checklist
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-6">
                        Please select any block you want to inspect seats in that section.
                      </div>

                      {/* Block Map */}
                      {renderBlockMap()}

                      {/* Action Button */}
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => {
                            if (!selectedBlock) {
                              alert('Please select a block first');
                              return;
                            }
                          }}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          View Assets for Selected Block
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Step 2: Asset/Seat Selection (when block is selected) */
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Select items in {selectedBlock}</h4>
                        <button
                          onClick={() => {
                            setSelectedBlock(null);
                            setSelectedSeats({});
                          }}
                          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Back to Blocks
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-6">
                        Please select any items (assets) you want to inspect in this block.
                      </div>

                      {/* Show assets assigned to this block as selectable items */}
                      <div className="bg-gray-50 p-6 rounded-xl mb-6">
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-2">Assets in Block {selectedBlock}</h5>
                          <div className="text-sm text-gray-600">
                            {getAssetsForSelectedBlock.length} asset{getAssetsForSelectedBlock.length !== 1 ? 's' : ''} assigned to this block
                          </div>
                        </div>
                        
                        {/* Render assets as seats/selectable items */}
                        {renderAssetSeats()}
                        
                        {/* Fallback: Show regular seating chart if no assets */}
                        {getAssetsForSelectedBlock.length === 0 && (
                          <>
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <h5 className="font-medium text-gray-800 mb-2">Default Seating Chart</h5>
                              <div className="text-sm text-gray-600 mb-4">
                                No assets found for this block. Using default seating arrangement.
                              </div>
                              <div className="overflow-x-auto">
                                <div className="min-w-max">
                                  {renderFallbackSeatingChart()}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Selected Items Summary */}
                      {Object.keys(selectedSeats).length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                          <h5 className="font-medium mb-2">Selected Items in {selectedBlock}:</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedSeats).map(([itemId, item]) => (
                              <span key={itemId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {item.assetName || 'Item'} #{item.index + 1}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 text-sm text-blue-700">
                            Total selected: {Object.keys(selectedSeats).length} item{Object.keys(selectedSeats).length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {getAssetsForSelectedBlock.length > 0 
                            ? `${getAssetsForSelectedBlock.length} asset${getAssetsForSelectedBlock.length !== 1 ? 's' : ''} available`
                            : 'No assets assigned to this block'}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedBlock(null);
                              setSelectedSeats({});
                            }}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (Object.keys(selectedSeats).length === 0) {
                                alert('Please select at least one item');
                                return;
                              }
                              // Navigate to NewIssue page with first selected item as a prefill model
                              // Build array of selected items and include asset objects when available
                              const selKeys = Object.keys(selectedSeats || {});
                              const selectedItems = selKeys.map(k => {
                                const it = selectedSeats[k];
                                const assetObj = assets.find(a => (a.id || a._id) === it?.assetId) || null;
                                const info = assetObj ? getAssetLocationInfo(assetObj) : { building: it?.blockId || selectedBlock, blocks: [] };
                                const blockCfg = blockConfiguration.blocks.find(b => String(b.id) === String(it?.blockId));
                                const buildingName = info.building || (blockCfg && blockCfg.name) || (it?.blockId || selectedBlock);
                                return {
                                  key: k,
                                  assetId: it?.assetId,
                                  assetName: it?.assetName || assetObj?.name || '',
                                  index: it?.index,
                                  blockId: it?.blockId,
                                  building: buildingName,
                                  asset: assetObj,
                                };
                              });

                              const first = selectedItems[0] || {};
                              const model = {
                                title: `Inspection - ${first.assetName || ''}`,
                                description: `Inspection for ${first.assetName || ''} (instance #${(first.index ?? 0) + 1}) in ${first.building || selectedBlock}`,
                                category: '',
                                building: first.building || '',
                                floor: '',
                                unit: first.index != null ? String((first.index || 0) + 1) : '',
                                assetId: first.assetId,
                                selectedItems,
                              };
                              // If user not authenticated, redirect to login; otherwise open NewIssue as modal
                              const token = localStorage.getItem('token');
                              if (!token) {
                                navigate('/login');
                              } else {
                                // close property details modal and open new-issue modal directly
                                setShowDetailsModal(false);
                                setShowFloorMap(false);
                                setSelectedBlock(null);
                                setSelectedSeats({});
                                setNewIssueModel(model);
                                setShowNewIssueModal(true);
                              }
                            }}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            <span>Proceed</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="mt-4">
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
                    const selections = Object.keys(checklistSelections).filter(k => (checklistSelections[k] || 0) > 0);
                    if (selections.length === 0) {
                      alert('Please select at least one item (building or assets)');
                      return;
                    }
                    setIsChecklistSubmitting(true);
                    try {
                      const propertyId = selectedProperty.id || selectedProperty._id;
                      const posts = [];
                      for (const key of selections) {
                        const count = checklistSelections[key] || 0;
                        const isBuilding = key === 'building';
                        const isItem = key.startsWith('item-');
                        
                        if (isBuilding) {
                          const payload = {
                            title: `Inspection - ${selectedProperty.name}`,
                            description: checklistDescription || `Inspection item for building`,
                            tags: ['inspection'],
                            location: selectedProperty.name,
                            address: selectedProperty.address,
                            assetId: null,
                            propertyId,
                          };
                          posts.push(axios.post(`${backendBase}/api/issues`, payload));
                        } else if (isItem) {
                          const itemId = key.replace('item-', '');
                          // itemId format: assetId-index or block-row-seat
                          if (itemId.includes('-')) {
                            const parts = itemId.split('-');
                            if (parts.length >= 2) {
                              const [first, second] = parts;
                              let title, description;
                              
                              // Check if it's an asset item (assetId-index)
                              const asset = assets.find(a => (a.id || a._id) === first);
                              if (asset) {
                                title = `Asset Inspection - ${asset.name}`;
                                description = checklistDescription || `Inspection for ${asset.name} (instance #${parseInt(second) + 1}) in Block ${selectedBlock}`;
                              } else {
                                // It's a seat item (block-row-seat)
                                title = `Seat Inspection - Block ${first}`;
                                description = checklistDescription || `Inspection for seat in Block ${first}, Row ${parseInt(second) + 1}, Seat ${parts.length > 2 ? parseInt(parts[2]) + 1 : 'N/A'}`;
                              }
                              
                              const payload = {
                                title,
                                description,
                                tags: ['inspection', `block-${selectedBlock}`],
                                location: selectedProperty.name,
                                address: selectedProperty.address,
                                assetId: asset ? asset.id || asset._id : null,
                                propertyId,
                              };
                              posts.push(axios.post(`${backendBase}/api/issues`, payload));
                            }
                          }
                        } else {
                          const asset = assets.find(a => (a.id || a._id) === key);
                          const titleBase = asset?.name || 'Asset';
                          for (let n = 0; n < Math.max(1, count); n++) {
                            const payload = {
                              title: `Inspection - ${titleBase}`,
                              description: checklistDescription || `Inspection item for asset ${titleBase}`,
                              tags: ['inspection'],
                              location: selectedProperty.name,
                              address: selectedProperty.address,
                              assetId: key,
                              propertyId,
                            };
                            posts.push(axios.post(`${backendBase}/api/issues`, payload));
                          }
                        }
                      }

                      await Promise.all(posts);
                      await fetchPropertyDetails(selectedProperty);
                      setChecklistSelections({});
                      setChecklistDescription('');
                      setSelectedSeats({});
                      setSelectedBlock(null);
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
                <button
                  type="button"
                  onClick={() => setDetailsTab('issues')}
                  className={`py-2 px-1 border-b-2 text-sm font-medium ${detailsTab === 'issues' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Issues ({issues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsTab('assets')}
                  className={`py-2 px-1 border-b-2 text-sm font-medium ${detailsTab === 'assets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Assets ({assets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsTab('technicians')}
                  className={`py-2 px-1 border-b-2 text-sm font-medium ${detailsTab === 'technicians' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Technicians ({technicians.length})
                </button>
              </nav>
            </div>

            {/* Details Tab Content */}
            {detailsTab === 'issues' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Issues</h3>
                <p className="text-sm text-gray-600">To report an issue, select items from the block map and click <strong>Proceed</strong>. You'll be taken to the New Issue page with the selected asset prefilled.</p>
              </div>
            )}

            {detailsTab === 'assets' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Assets Assigned</h3>
                <div>
                  {assets.length === 0 ? (
                    <div className="text-xs text-gray-500">No assets assigned to this property.</div>
                  ) : (
                    assets.map((a) => {
                      const aid = a.id || a._id;
                      const qty = a.quantity ?? 1;
                      const selectedCount = checklistSelections[aid] || 0;
                      const info = getAssetLocationInfo(a);
                      const blocks = (info.blocks || []).filter(Boolean);
                      return (
                        <div key={aid} className={`p-2 mb-2 rounded border ${selectedCount > 0 ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-800'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">{a.name || aid}</div>
                              <div className="text-xs text-gray-500">{a.type || ''}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {info.building ? info.building + ' · ' : ''}
                                {blocks.length ? (blocks.length === 1 ? 'Block ' + blocks[0] : 'Blocks ' + blocks.join(', ')) : ''}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: qty }).map((_, idx) => {
                                const sel = idx < selectedCount;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setChecklistSelections(s => { const cur = s[aid] || 0; const next = (idx < cur) ? idx : (idx + 1); return { ...s, [aid]: next }; }); }}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-xs ${sel ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
                                    aria-pressed={sel}
                                  >
                                    {sel ? '●' : '○'}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => { setEditingAsset(a); setAssetForm({ name: a.name || '', type: a.type || '', description: a.description || '', quantity: a.quantity ?? 1, building: info.building || '', blocks: (blocks || []) }); setOriginalAssetBlocks(blocks || []); }}
                                className="px-3 py-1 bg-gray-100 rounded text-sm ml-2"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAsset(a)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm ml-2"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">Available: {qty}{selectedCount > 0 ? ` · Selected: ${selectedCount}` : ''}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {detailsTab === 'technicians' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Technicians</h3>
                {technicians.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No technicians available for assignment.</p>
                ) : (
                  <div className="space-y-2">
                    {technicians.map(t => (
                      <div key={t.id || t._id} className="p-3 bg-white rounded border">{t.name} — {t.phone}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
      {showNewIssueModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4" style={{ zIndex: 9999 }} role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl h-[90vh] bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="h-full overflow-y-auto">
              <NewIssue asModal={true} model={newIssueModel} onClose={(refresh) => { setShowNewIssueModal(false); setNewIssueModel(null); if (refresh) fetchPropertyDetails(selectedProperty); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesPage;