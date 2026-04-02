import React, { useState } from 'react';
import ResourceCard from './ResourceCard';
import AddResourceModal from './AddResourceModal';
import { useResources } from '../../../context/ResourceContext';

const ResourceList = () => {
  const { resources, deleteResource, updateResourceStatus } = useResources();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const handleDelete = async (resource) => {
    if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      try {
        await deleteResource(resource._id);
      } catch (error) {
        alert('Failed to delete resource');
      }
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowAddModal(true);
  };

  const handleViewMatches = (resource) => {
    // Navigate to matches page with resource filter
    window.location.href = `/dashboard/matches?resource=${resource._id}`;
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingResource(null);
  };

  const wasteResources = resources.filter(r => r.resource_type === 'waste');
  const inputResources = resources.filter(r => r.resource_type === 'resource');

  return (
    // Add overflow-y-auto and max height here
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Resources</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Resource
          </button>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">You haven't added any resources yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            {/* Waste Outputs */}
            {wasteResources.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center sticky top-0 bg-gray-50 py-2">
                  <span className="mr-2">🗑️</span> Waste Outputs
                  <span className="ml-2 text-sm text-gray-500">({wasteResources.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wasteResources.map(resource => (
                    <ResourceCard
                      key={resource._id}
                      resource={resource}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewMatches={handleViewMatches}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resource Inputs */}
            {inputResources.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center sticky top-0 bg-gray-50 py-2">
                  <span className="mr-2">📦</span> Resource Inputs
                  <span className="ml-2 text-sm text-gray-500">({inputResources.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inputResources.map(resource => (
                    <ResourceCard
                      key={resource._id}
                      resource={resource}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewMatches={handleViewMatches}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AddResourceModal
          isOpen={showAddModal}
          onClose={handleModalClose}
          editingResource={editingResource}
        />
      </div>
    </div>
  );
};

export default ResourceList;