// src/pages/Dashboard/components/AddResourceModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import { useResources } from '../../../context/ResourceContext';

const AddResourceModal = ({ isOpen, onClose, editingResource = null }) => {
  const [loading, setLoading] = useState(false);
  const { addResource, updateResource } = useResources();
  const [formData, setFormData] = useState({
    resource_type: 'waste',
    category: '',
    title: '',
    description: '',
    quantity: '',
    unit: '',
    frequency: 'one_time',
    availability: '',
    specifications: []
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    if (editingResource) {
      setFormData({
        resource_type: editingResource.resource_type || 'waste',
        category: editingResource.category || '',
        title: editingResource.title || '',
        description: editingResource.description || '',
        quantity: editingResource.quantity || '',
        unit: editingResource.unit || '',
        frequency: editingResource.frequency || 'one_time',
        availability: editingResource.availability || '',
        specifications: editingResource.specifications || []
      });
    } else {
      setFormData({
        resource_type: 'waste',
        category: '',
        title: '',
        description: '',
        quantity: '',
        unit: '',
        frequency: 'one_time',
        availability: '',
        specifications: []
      });
      setSpecKey('');
      setSpecValue('');
    }
  }, [editingResource, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSpecification = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, { key: specKey, value: specValue }]
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const handleRemoveSpecification = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      specifications: newSpecs
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingResource) {
        await updateResource(editingResource._id, formData);
      } else {
        await addResource(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert(error.response?.data?.error || error.error || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingResource ? "Edit Resource" : "Add New Resource"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resource Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resource Type *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="resource_type"
                value="waste"
                checked={formData.resource_type === 'waste'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Waste Output</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="resource_type"
                value="resource"
                checked={formData.resource_type === 'resource'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Resource Input</span>
            </label>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            <option value="heat">Heat</option>
            <option value="water">Water</option>
            <option value="metal">Metal</option>
            <option value="plastic">Plastic</option>
            <option value="paper">Paper</option>
            <option value="glass">Glass</option>
            <option value="organic">Organic</option>
            <option value="chemical">Chemical</option>
            <option value="electricity">Electricity</option>
            <option value="compressed_air">Compressed Air</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Excess Heat from Manufacturing Process"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Provide detailed information about this resource/waste..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quantity and Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select unit</option>
              <option value="kg">kg</option>
              <option value="tons">tons</option>
              <option value="kW">kW</option>
              <option value="liters">liters</option>
              <option value="m³">m³</option>
              <option value="units">units</option>
            </select>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability Frequency
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="one_time">One Time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="continuous">Continuous</option>
          </select>
        </div>

        {/* Availability Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Availability Info
          </label>
          <input
            type="text"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            placeholder="e.g., Available from January 2024"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specifications
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              placeholder="Key (e.g., Temperature)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              placeholder="Value (e.g., 150°C)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSpecification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          
          {formData.specifications.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm">
                    <strong>{spec.key}:</strong> {spec.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (editingResource ? 'Update Resource' : 'Create Resource')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddResourceModal;