import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewIssue from './NewIssue';
import heroImg from '../assets/1.jpg';
import heroVid1 from '../assets/135907-764370874_small.mp4';
import heroVid2 from '../assets/136906-765457769_small.mp4';
import heroVid3 from '../assets/136909-765457779_small.mp4';

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

  // Hero slides (images/videos) - use local `src/assets` files
  const heroSlides = [
    heroImg,
    heroVid1,
    heroVid2,
    heroVid3,
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => {
      setSlideIndex(i => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [heroSlides.length, paused]);

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
  const backendBase = import.meta.env.VITE_API_URL + '';
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
    } else {
      // Remove Authorization header for anonymous users
      delete axios.defaults.headers.common['Authorization'];
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
      // Try to get the property owner's userId (clientId or userId)
      let userId = selectedProperty.clientId || selectedProperty.userId || (selectedProperty.user && (selectedProperty.user.id || selectedProperty.user._id));
      if (!userId && selectedProperty.owner) {
        userId = selectedProperty.owner.id || selectedProperty.owner._id;
      }

      // Fetch all users and check if userId exists
      let validUserId = undefined;
      if (userId) {
        try {
          const usersRes = await axios.get(`${backendBase}/api/users`);
          const users = Array.isArray(usersRes.data) ? usersRes.data : [];
          if (users.some(u => u.id === userId || u._id === userId)) {
            validUserId = userId;
          }
        } catch (e) {
          // If user fetch fails, fallback to not including userId
          validUserId = undefined;
        }
      }

      const payload = {
        title: newIssue.title,
        description: newIssue.description,
        tags: newIssue.tags ? newIssue.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        location: selectedProperty.name,
        address: selectedProperty.address,
        assetId: newIssue.assetId || null,
        propertyId: selectedProperty.id || selectedProperty._id,
        ...(validUserId ? { userId: validUserId } : {}),
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
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-start">
              <div className="md:col-span-1">
                <img
                  src={getImageUrl((Array.isArray(selectedProperty.photos) && selectedProperty.photos.length > 0) ? selectedProperty.photos[0] : (selectedProperty.image || selectedProperty.photo))}
                  alt={selectedProperty.name}
                  className="w-full h-56 md:h-64 object-cover rounded-xl shadow-lg"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedProperty.name}</h2>
                    <p className="text-sm text-gray-600 mt-2">{selectedProperty.address}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">(12 reviews)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-700 ml-4 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
                    <p className="font-semibold text-gray-900">{selectedProperty.type || 'Residential'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Price</p>
                    <p className="font-semibold text-gray-900 text-lg">{selectedProperty.price || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <p className="font-semibold">
                      <span className={`px-2 py-1 rounded-full text-xs ${selectedProperty.forRent ? 'bg-blue-100 text-blue-800' : selectedProperty.forSale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedProperty.forRent ? 'For Rent' : selectedProperty.forSale ? 'For Sale' : 'Available'}
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Area</p>
                    <p className="font-semibold text-gray-900">{selectedProperty.area ?? selectedProperty.sqft ?? '-'}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedProperty.description || 'A premium property offering luxury living with modern amenities and elegant design.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Inspection Checklist</h3>
              <div className="mb-6 flex items-center justify-between">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!(checklistSelections['building'] > 0)}
                    onChange={() => setChecklistSelections(s => ({ ...s, building: s.building > 0 ? 0 : 1 }))}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Building: {selectedProperty.name}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowFloorMap(s => !s)}
                  className="text-sm px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                >
                  {showFloorMap ? 'Close Map' : 'View Floor Map'}
                </button>
              </div>

              {!showFloorMap && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-3 font-medium">Select Assets for Inspection</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assets && assets.length > 0 ? (
                      assets.map((a) => {
                        const aid = a.id || a._id;
                        return (
                          <label key={aid} className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!(checklistSelections[aid] > 0)}
                              onChange={() => setChecklistSelections(s => ({ ...s, [aid]: s[aid] > 0 ? 0 : 1 }))}
                              className="h-5 w-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{a.name || aid}</div>
                              <div className="text-xs text-gray-500 mt-1">{a.type || ''}</div>
                              <div className="text-xs text-gray-400 mt-2">
                                {(() => {
                                  const info = getAssetLocationInfo(a);
                                  const blocks = (info.blocks || []).filter(Boolean);
                                  return `${info.building ? info.building + ' · ' : ''}${blocks.length ? (blocks.length === 1 ? 'Block ' + blocks[0] : 'Blocks ' + blocks.join(', ')) : ''}`;
                                })()}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">Available: {a.quantity ?? 1}{checklistSelections[aid] > 0 ? ` · Selected: ${checklistSelections[aid]}` : ''}</div>
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setChecklistSelections(s => { const cur = s[aid] || 0; const max = a.quantity || 1; const next = cur >= max ? 0 : cur + 1; return { ...s, [aid]: next }; }); }}
                                  className={`px-3 py-1 rounded text-xs font-medium ${checklistSelections[aid] > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                                >
                                  {checklistSelections[aid] > 0 ? (checklistSelections[aid] === (a.quantity || 1) ? 'Deselect All' : 'Select More') : 'Select'}
                                </button>
                                { (checklistSelections[aid] > 0) && (
                                  <div className="text-xs text-gray-600 font-medium">{checklistSelections[aid]} / {a.quantity ?? 1}</div>
                                ) }
                              </div>
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 col-span-2">No assets found for this property.</p>
                    )}
                  </div>
                </div>
              )}

              {showFloorMap && (
                <div className="mb-6">
                  {/* Step 1: Block Selection (if no block selected) */}
                  {!selectedBlock ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-semibold text-gray-900">Select a Block</h4>
                        <button
                          onClick={() => setShowFloorMap(false)}
                          className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Back to Checklist
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-6">
                        Please select any block you want to inspect seats in that section.
                      </div>

                      {/* Block Map */}
                      {renderBlockMap()}

                      {/* Action Button */}
                      <div className="flex justify-end mt-8">
                        <button
                          onClick={() => {
                            if (!selectedBlock) {
                              alert('Please select a block first');
                              return;
                            }
                          }}
                          className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors shadow-lg"
                        >
                          View Assets for Selected Block
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Step 2: Asset/Seat Selection (when block is selected) */
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-semibold text-gray-900">Select items in Block {selectedBlock}</h4>
                        <button
                          onClick={() => {
                            setSelectedBlock(null);
                            setSelectedSeats({});
                          }}
                          className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
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
                      <div className="bg-white p-6 rounded-xl mb-6 border border-gray-200">
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Assets in Block {selectedBlock}</h5>
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
                              <h5 className="font-semibold text-gray-900 mb-2">Default Seating Chart</h5>
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
                        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                          <h5 className="font-semibold mb-3 text-blue-900">Selected Items in Block {selectedBlock}:</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedSeats).map(([itemId, item]) => (
                              <span key={itemId} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                {item.assetName || 'Item'} #{item.index + 1}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 text-sm text-blue-700 font-medium">
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
                              // Open NewIssue modal. If user is not authenticated, mark model so NewIssue can prompt/login on submit.
                              const token = localStorage.getItem('token');
                              const modelToOpen = { ...model, requiresAuth: !token };
                              // close property details modal and open new-issue modal directly
                              setShowDetailsModal(false);
                              setShowFloorMap(false);
                              setSelectedBlock(null);
                              setSelectedSeats({});
                              setNewIssueModel(modelToOpen);
                              setShowNewIssueModal(true);
                            }}
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                          >
                            <span>Proceed to Report</span>
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

              <div className="mt-6">
                <textarea
                  placeholder="Add notes or description for the inspection (optional)"
                  value={checklistDescription}
                  onChange={(e) => setChecklistDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="mt-6">
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-md"
                >
                  {isChecklistSubmitting ? 'Creating Issues...' : 'Create Inspection Issues'}
                </button>
              </div>
            </div>

            {/* Tabs for Issues and Assets */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  type="button"
                  onClick={() => setDetailsTab('issues')}
                  className={`py-3 px-1 border-b-2 font-medium ${detailsTab === 'issues' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Issues ({issues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsTab('assets')}
                  className={`py-3 px-1 border-b-2 font-medium ${detailsTab === 'assets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Assets ({assets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsTab('technicians')}
                  className={`py-3 px-1 border-b-2 font-medium ${detailsTab === 'technicians' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Technicians ({technicians.length})
                </button>
              </nav>
            </div>

            {/* Details Tab Content */}

            {detailsTab === 'assets' && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Assets Assigned</h3>
                <div>
                  {assets.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-500">No assets assigned to this property.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assets.map((a) => {
                        const aid = a.id || a._id;
                        const qty = a.quantity ?? 1;
                        const selectedCount = checklistSelections[aid] || 0;
                        const info = getAssetLocationInfo(a);
                        const blocks = (info.blocks || []).filter(Boolean);
                        return (
                          <div key={aid} className={`p-4 rounded-xl border ${selectedCount > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${selectedCount > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{a.name || aid}</div>
                                    <div className="text-xs text-gray-500 mt-1">{a.type || ''}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {info.building ? info.building + ' · ' : ''}
                                      {blocks.length ? (blocks.length === 1 ? 'Block ' + blocks[0] : 'Blocks ' + blocks.join(', ')) : ''}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: qty }).map((_, idx) => {
                                    const sel = idx < selectedCount;
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setChecklistSelections(s => { const cur = s[aid] || 0; const next = (idx < cur) ? idx : (idx + 1); return { ...s, [aid]: next }; }); }}
                                        className={`w-7 h-7 rounded flex items-center justify-center text-xs ${sel ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        aria-pressed={sel}
                                      >
                                        {idx + 1}
                                      </button>
                                    );
                                  })}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { setEditingAsset(a); setAssetForm({ name: a.name || '', type: a.type || '', description: a.description || '', quantity: a.quantity ?? 1, building: info.building || '', blocks: (blocks || []) }); setOriginalAssetBlocks(blocks || []); }}
                                  className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAsset(a)}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500 font-medium">Available: {qty}{selectedCount > 0 ? ` · Selected: ${selectedCount}` : ''}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {detailsTab === 'technicians' && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Available Technicians</h3>
                {technicians.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No technicians available for assignment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {technicians.map(t => (
                      <div key={t.id || t._id} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-blue-600">{t.name?.charAt(0) || 'T'}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{t.name}</div>
                            <div className="text-sm text-gray-500">{t.phone}</div>
                          </div>
                        </div>
                      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50">
      {/* Enhanced Hero Section with Luxury Feel */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10">
          {/* Top Navigation Bar */}
          <div className="border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-10">
                  <div className="text-2xl font-serif font-light tracking-widest">MMS</div>
                  <div className="text-sm text-gray-300 font-light tracking-wider hidden md:block">Finest</div>
                </div>
                
                <nav className="hidden md:flex items-center space-x-8 text-sm font-light tracking-wide">
                  <a href="#" className="hover:text-amber-300 transition-colors">Home</a>
                  <a href="#" className="text-amber-300 border-b-2 border-amber-300 pb-1">Properties</a>
                </nav>
                
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate('/register')} className="text-sm px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all border border-white/20">
                    Sign up
                  </button>
                  <button onClick={() => navigate('/login')} className="text-sm px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all border border-white/20">
                    Sign in
                  </button>
                </div>
                
              </div>
            </div>
          </div>
          
          {/* Hero Content with Carousel */}
          <div className="relative">
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="relative w-full h-[70vh] min-h-[600px] overflow-hidden"
            >
              {heroSlides.map((s, idx) => {
                const isActive = idx === slideIndex;
                const key = `slide-${idx}`;
                const isVideo = /\.(mp4|webm)(\?.*)?$/i.test(s);
                if (isVideo) {
                  return (
                    <video
                      key={key}
                      src={s}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                  );
                }
                return (
                  <div
                    key={key}
                    style={{ backgroundImage: `url(${s})` }}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />
                );
              })}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              
              {/* Hero text content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                  <div className="max-w-2xl">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-tight mb-6">
                      Live Where Elegance
                      <span className="block font-medium text-amber-300">Feels Like Home</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 max-w-xl font-light leading-relaxed">
                      Discover a curated collection of prestigious homes, villas, and residences designed for those who appreciate elegance, comfort, and timeless value.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-full transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                        Explore Properties
                      </button>
                      <button className="px-8 py-3 bg-transparent border-2 border-white/30 hover:border-white text-white font-medium rounded-full transition-all">
                        Request a Private Viewing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Carousel controls */}
              <button 
                onClick={() => setSlideIndex((slideIndex - 1 + heroSlides.length) % heroSlides.length)}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => setSlideIndex((slideIndex + 1) % heroSlides.length)}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Slide indicators */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                {heroSlides.map((_, i) => (
                  <button
                    key={`dot-${i}`}
                    onClick={() => setSlideIndex(i)}
                    className={`transition-all ${i === slideIndex ? 'w-12 h-1.5 bg-amber-400' : 'w-8 h-1.5 bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Section with Elegant Design */}
      <div className="relative -mt-16 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                <div className="lg:col-span-2">
                  <div className="inline-flex items-center px-4 py-2 bg-amber-50 rounded-full mb-6">
                    <span className="text-sm font-medium text-amber-700">ABOUT US</span>
                  </div>
                  <h2 className="text-4xl font-serif font-light text-gray-900 mb-6">
                    Where Your Next Chapter
                    <span className="block font-medium">Begins</span>
                  </h2>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-lg leading-relaxed">
                      We specialize in Mentainance of Properties  defined by quality, exclusivity, and attention to detail. Every property we present is carefully selected for its architecture, location, and lifestyle appeal, offering more than a home, but an experience.
                    </p>
                    <p className="leading-relaxed">
                      From modern city residences to serene private estates, we connect discerning Technician with spaces that reflect their success and aspirations.
                    </p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-serif font-light text-gray-900 mb-2">500+</div>
                      <div className="text-sm text-gray-500">Properties</div>
                    </div>
                   
                    <div className="text-center">
                      <div className="text-3xl font-serif font-light text-gray-900 mb-2">98%</div>
                      <div className="text-sm text-gray-500">Client Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-serif font-light text-gray-900 mb-2">50+</div>
                      <div className="text-sm text-gray-500">Awards</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    {['/build/static/media/thumb1.jpg','/build/static/media/thumb2.jpg','/build/static/media/thumb3.jpg','/build/static/media/thumb4.jpg'].map((src, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-2xl">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-amber-400 to-rose-400 rounded-full opacity-10 blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search properties by name, location, or type..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-14 pr-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50/50"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="px-6 py-3.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                    For Business
                  </button>
                  <button className="px-6 py-3.5 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium rounded-xl transition-all">
                    Request Viewing
                  </button>
                </div>
              </div>
              
              {/* Results count */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-light text-gray-900">Featured Properties</h3>
                  <p className="text-gray-600 mt-1">
                    Showing <span className="font-medium text-gray-900">{paginatedProperties.length}</span> of <span className="font-medium text-gray-900">{filteredProperties.length}</span> premium properties
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <button className="p-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </button>
                  <button className="p-2.5 rounded-lg bg-amber-500 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-emerald-800 font-medium">{success}</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-rose-100 border border-red-200 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-600 text-lg">Loading premium properties...</p>
            </div>
          ) : (
            <>
              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {paginatedProperties.map((property) => {
                  const key = property.id || property._id || property.name;
                  const img = getImageUrl((Array.isArray(property.photos) && property.photos.length > 0) ? property.photos[0] : (property.image || property.photo));
                  const tag = property.forRent || property.rent ? 'RENT' : (property.forSale || property.sale ? 'SALE' : 'PREMIUM');
                  const isForRent = property.forRent || property.rent;
                  const tagColor = isForRent ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-green-500';
                  
                  return (
                    <div
                      key={key}
                      onClick={() => fetchPropertyDetails(property)}
                      className="group cursor-pointer"
                    >
                      <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                        {/* Property Image */}
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            src={img} 
                            alt={property.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            onError={(e) => { e.target.src = '/default-property.png'; }} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                          
                          {/* Tag */}
                          <div className="absolute top-4 left-4">
                            <span className={`px-4 py-1.5 text-xs font-bold text-white rounded-full bg-gradient-to-r ${tagColor} shadow-lg`}>
                              {tag}
                            </span>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                            <button className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Price */}
                          {property.price && (
                            <div className="absolute bottom-4 left-4">
                              <div className="text-2xl font-bold text-white">{property.price}</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Property Details */}
                        <div className="p-6">
                          <div className="mb-5">
                            <h3 className="text-xl font-serif font-semibold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                              {property.name || 'Luxury Property'}
                            </h3>
                            <p className="text-gray-600 mt-2 flex items-center text-sm">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{property.address || 'Prime Location'}</span>
                            </p>
                          </div>

                          {/* Property Features */}
                          <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Beds</div>
                              <div className="font-bold text-gray-900 text-lg">{property.beds ?? 4}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Baths</div>
                              <div className="font-bold text-gray-900 text-lg">{property.baths ?? 3}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Area</div>
                              <div className="font-bold text-gray-900 text-lg">{property.area ?? property.sqft ?? '2,500'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Type</div>
                              <div className="font-bold text-gray-900 text-lg">{property.type?.split(' ')[0] || 'Villa'}</div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchPropertyDetails(property);
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-black text-white font-medium rounded-xl hover:shadow-xl transition-all hover:-translate-y-0.5"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* No Results Message */}
              {filteredProperties.length === 0 && !isLoading && (
                <div className="text-center py-20">
                  <div className="w-32 h-32 mx-auto mb-8 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-serif font-light text-gray-900 mb-4">No properties found</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">Try adjusting your search criteria or browse our featured collections.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all"
                  >
                    View All Properties
                  </button>
                </div>
              )}
            </>
          )}

          {/* Enhanced Pagination */}
          {filteredProperties.length > itemsPerPage && (
            <div className="flex items-center justify-center mt-16">
              <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-lg border border-gray-100">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white hover:-translate-x-0.5'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-2 px-4">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-xl font-medium transition-all ${currentPage === pageNum ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100 hover:scale-105'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white hover:translate-x-0.5'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0">
              <div className="text-2xl font-serif font-light tracking-widest mb-4">MMS</div>
              <p className="text-gray-400">Finest</p>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} MMS.Finest. All rights reserved.
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal />
      
      {/* New Issue Modal */}
      {showNewIssueModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl">
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