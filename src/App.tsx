import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Download, Upload, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, CreditCard as Edit3, Trash2, Eye, Settings, Users, Bell, Menu, X, Home, ShoppingCart, FileText, PieChart, Calendar, DollarSign, Box, Save, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  supplier: string;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  description?: string;
}

interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'salida';
  quantity: number;
  date: string;
  user: string;
  notes: string;
  previousStock: number;
  newStock: number;
}

interface NewProduct {
  name: string;
  sku: string;
  category: string;
  stock: string;
  minStock: string;
  price: string;
  supplier: string;
  description: string;
}

interface NewMovement {
  productId: string;
  type: 'entrada' | 'salida';
  quantity: string;
  notes: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showViewProduct, setShowViewProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  // Form states
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    sku: '',
    category: '',
    stock: '',
    minStock: '',
    price: '',
    supplier: '',
    description: ''
  });

  const [newMovement, setNewMovement] = useState<NewMovement>({
    productId: '',
    type: 'entrada',
    quantity: '',
    notes: ''
  });

  // Demo data with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: '1',
        name: 'Laptop Dell Inspiron 15',
        sku: 'DELL-INS-15-001',
        category: 'Electrónicos',
        stock: 25,
        minStock: 10,
        price: 2500000,
        supplier: 'Dell Colombia',
        lastUpdated: '2025-01-15',
        status: 'in-stock',
        description: 'Laptop empresarial con procesador Intel i7, 16GB RAM, 512GB SSD'
      },
      {
        id: '2',
        name: 'Mouse Logitech MX Master 3',
        sku: 'LOG-MX3-001',
        category: 'Accesorios',
        stock: 5,
        minStock: 15,
        price: 350000,
        supplier: 'Logitech',
        lastUpdated: '2025-01-14',
        status: 'low-stock',
        description: 'Mouse inalámbrico ergonómico para profesionales'
      },
      {
        id: '3',
        name: 'Monitor Samsung 27" 4K',
        sku: 'SAM-MON-27-4K',
        category: 'Electrónicos',
        stock: 0,
        minStock: 5,
        price: 1800000,
        supplier: 'Samsung Electronics',
        lastUpdated: '2025-01-13',
        status: 'out-of-stock',
        description: 'Monitor 4K UHD de 27 pulgadas con tecnología HDR'
      },
      {
        id: '4',
        name: 'Teclado Mecánico Corsair K95',
        sku: 'COR-K95-RGB',
        category: 'Accesorios',
        stock: 18,
        minStock: 8,
        price: 650000,
        supplier: 'Corsair',
        lastUpdated: '2025-01-15',
        status: 'in-stock',
        description: 'Teclado mecánico RGB con switches Cherry MX'
      },
      {
        id: '5',
        name: 'Impresora HP LaserJet Pro',
        sku: 'HP-LJ-PRO-001',
        category: 'Oficina',
        stock: 12,
        minStock: 6,
        price: 1200000,
        supplier: 'HP Inc.',
        lastUpdated: '2025-01-12',
        status: 'in-stock',
        description: 'Impresora láser monocromática para oficina'
      },
      {
        id: '6',
        name: 'iPhone 15 Pro Max',
        sku: 'APL-IP15-PMX',
        category: 'Electrónicos',
        stock: 8,
        minStock: 5,
        price: 4500000,
        supplier: 'Apple Colombia',
        lastUpdated: '2025-01-16',
        status: 'in-stock',
        description: 'Smartphone premium con chip A17 Pro y cámara de 48MP'
      },
      {
        id: '7',
        name: 'Disco Duro Externo WD 2TB',
        sku: 'WDT-EHD-2TB',
        category: 'Almacenamiento',
        stock: 15,
        minStock: 10,
        price: 280000,
        supplier: 'Western Digital',
        lastUpdated: '2025-01-15',
        status: 'in-stock',
        description: 'Disco duro externo USB 3.0 de 2TB para respaldo de datos'
      },
      {
        id: '8',
        name: 'Router TP-Link AC1200',
        sku: 'TPL-RT-AC1200',
        category: 'Redes',
        stock: 22,
        minStock: 8,
        price: 180000,
        supplier: 'TP-Link',
        lastUpdated: '2025-01-14',
        status: 'in-stock',
        description: 'Router inalámbrico dual banda para hogar y oficina'
      },
      {
        id: '9',
        name: 'Licencia Windows 11 Pro',
        sku: 'MSW-W11-PRO',
        category: 'Software',
        stock: 30,
        minStock: 5,
        price: 350000,
        supplier: 'Microsoft Colombia',
        lastUpdated: '2025-01-16',
        status: 'in-stock',
        description: 'Licencia digital para Windows 11 Pro'
      },
      {
        id: '10',
        name: 'Tarjeta Gráfica NVIDIA RTX 4060',
        sku: 'NV-RTX4060-8G',
        category: 'Componentes',
        stock: 6,
        minStock: 3,
        price: 1800000,
        supplier: 'NVIDIA Partners',
        lastUpdated: '2025-01-15',
        status: 'in-stock',
        description: 'Tarjeta gráfica para gaming y diseño con 8GB GDDR6'
      },
      {
        id: '11',
        name: 'Audífonos Sony WH-1000XM5',
        sku: 'SON-WH1000XM5',
        category: 'Accesorios',
        stock: 12,
        minStock: 7,
        price: 850000,
        supplier: 'Sony Colombia',
        lastUpdated: '2025-01-14',
        status: 'in-stock',
        description: 'Audífonos inalámbricos con cancelación de ruido activa'
      },
      {
        id: '12',
        name: 'SSD Samsung 970 EVO 1TB',
        sku: 'SAM-970EVO-1T',
        category: 'Almacenamiento',
        stock: 9,
        minStock: 4,
        price: 450000,
        supplier: 'Samsung Electronics',
        lastUpdated: '2025-01-13',
        status: 'in-stock',
        description: 'Unidad de estado sólido NVMe de alta velocidad'
      },
      {
        id: '13',
        name: 'Proyector Epson EB-S41',
        sku: 'EPS-EBS41-001',
        category: 'Oficina',
        stock: 4,
        minStock: 2,
        price: 950000,
        supplier: 'Epson Colombia',
        lastUpdated: '2025-01-12',
        status: 'in-stock',
        description: 'Proyector LED de 3,300 lúmenes para presentaciones'
      },
      {
        id: '14',
        name: 'Switch Cisco Catalyst 2960',
        sku: 'CIS-CAT2960-24',
        category: 'Redes',
        stock: 3,
        minStock: 2,
        price: 2200000,
        supplier: 'Cisco Systems',
        lastUpdated: '2025-01-11',
        status: 'in-stock',
        description: 'Switch administrable de 24 puertos Gigabit Ethernet'
      },
      {
        id: '15',
        name: 'Licencia Adobe Creative Cloud',
        sku: 'ADB-CC-ANNUAL',
        category: 'Software',
        stock: 18,
        minStock: 5,
        price: 720000,
        supplier: 'Adobe Colombia',
        lastUpdated: '2025-01-16',
        status: 'in-stock',
        description: 'Suscripción anual a Adobe Creative Cloud All Apps'
      }
    ];
  });

  const [movements, setMovements] = useState<Movement[]>(() => {
    const saved = localStorage.getItem('inventory_movements');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: '1',
        productId: '1',
        productName: 'Laptop Dell Inspiron 15',
        type: 'entrada',
        quantity: 10,
        date: '2025-01-15',
        user: 'Juan Pérez',
        notes: 'Compra mensual',
        previousStock: 15,
        newStock: 25
      },
      {
        id: '2',
        productId: '2',
        productName: 'Mouse Logitech MX Master 3',
        type: 'salida',
        quantity: 8,
        date: '2025-01-14',
        user: 'María García',
        notes: 'Venta a cliente corporativo',
        previousStock: 13,
        newStock: 5
      },
      {
        id: '3',
        productId: '4',
        productName: 'Teclado Mecánico Corsair K95',
        type: 'entrada',
        quantity: 5,
        date: '2025-01-13',
        user: 'Carlos López',
        notes: 'Reposición de stock',
        previousStock: 13,
        newStock: 18
      }
    ];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventory_movements', JSON.stringify(movements));
  }, [movements]);

  // Update product status based on stock
  const updateProductStatus = (product: Product): Product => {
    let status: 'in-stock' | 'low-stock' | 'out-of-stock';
    if (product.stock === 0) {
      status = 'out-of-stock';
    } else if (product.stock <= product.minStock) {
      status = 'low-stock';
    } else {
      status = 'in-stock';
    }
    return { ...product, status, lastUpdated: new Date().toISOString().split('T')[0] };
  };

  const categories = ['all', 'Electrónicos', 'Accesorios', 'Oficina', 'Software', 'Componentes'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.status === 'low-stock').length;
  const outOfStockProducts = products.filter(p => p.status === 'out-of-stock').length;
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-600 bg-green-100';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100';
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-stock': return 'En Stock';
      case 'low-stock': return 'Stock Bajo';
      case 'out-of-stock': return 'Agotado';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateSKU = (name: string, category: string) => {
    const nameCode = name.substring(0, 3).toUpperCase();
    const categoryCode = category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${nameCode}-${categoryCode}-${randomNum}`;
  };

  // Product CRUD operations
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.stock || !newProduct.price) {
      showNotification('error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      sku: newProduct.sku || generateSKU(newProduct.name, newProduct.category),
      category: newProduct.category,
      stock: parseInt(newProduct.stock),
      minStock: parseInt(newProduct.minStock) || 5,
      price: parseFloat(newProduct.price),
      supplier: newProduct.supplier || 'Sin especificar',
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'in-stock',
      description: newProduct.description
    };

    const updatedProduct = updateProductStatus(product);
    setProducts(prev => [...prev, updatedProduct]);
    
    // Reset form
    setNewProduct({
      name: '',
      sku: '',
      category: '',
      stock: '',
      minStock: '',
      price: '',
      supplier: '',
      description: ''
    });
    
    setShowAddProduct(false);
    showNotification('success', `Producto "${product.name}" agregado exitosamente`);
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    const updatedProduct = updateProductStatus(editingProduct);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setShowEditProduct(false);
    setEditingProduct(null);
    showNotification('success', `Producto "${updatedProduct.name}" actualizado exitosamente`);
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setMovements(prev => prev.filter(m => m.productId !== productId));
      showNotification('success', `Producto "${product.name}" eliminado exitosamente`);
    }
  };

  const handleAddMovement = () => {
    if (!newMovement.productId || !newMovement.quantity) {
      showNotification('error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const product = products.find(p => p.id === newMovement.productId);
    if (!product) {
      showNotification('error', 'Producto no encontrado');
      return;
    }

    const quantity = parseInt(newMovement.quantity);
    const previousStock = product.stock;
    let newStock = previousStock;

    if (newMovement.type === 'entrada') {
      newStock = previousStock + quantity;
    } else {
      newStock = previousStock - quantity;
      if (newStock < 0) {
        showNotification('error', 'No hay suficiente stock para esta salida');
        return;
      }
    }

    const movement: Movement = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type: newMovement.type,
      quantity,
      date: new Date().toISOString().split('T')[0],
      user: 'Usuario Demo',
      notes: newMovement.notes || '',
      previousStock,
      newStock
    };

    // Update product stock
    const updatedProduct = updateProductStatus({ ...product, stock: newStock });
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    setMovements(prev => [movement, ...prev]);

    // Reset form
    setNewMovement({
      productId: '',
      type: 'entrada',
      quantity: '',
      notes: ''
    });

    setShowMovementModal(false);
    showNotification('success', `Movimiento registrado: ${newMovement.type} de ${quantity} unidades`);
  };

  // Report generation functions
  const generateStockReport = () => {
    const reportData = products.map(product => ({
      'Producto': product.name,
      'SKU': product.sku,
      'Categoría': product.category,
      'Stock Actual': product.stock,
      'Stock Mínimo': product.minStock,
      'Estado': getStatusText(product.status),
      'Precio Unitario': formatCurrency(product.price),
      'Valor Total': formatCurrency(product.stock * product.price),
      'Proveedor': product.supplier,
      'Última Actualización': product.lastUpdated
    }));

    downloadCSV(reportData, 'reporte_stock_' + new Date().toISOString().split('T')[0]);
    showNotification('success', 'Reporte de stock descargado exitosamente');
  };

  const generateMovementsReport = () => {
    const reportData = movements.map(movement => ({
      'Fecha': movement.date,
      'Producto': movement.productName,
      'Tipo': movement.type === 'entrada' ? 'Entrada' : 'Salida',
      'Cantidad': movement.quantity,
      'Stock Anterior': movement.previousStock,
      'Stock Nuevo': movement.newStock,
      'Usuario': movement.user,
      'Notas': movement.notes
    }));

    downloadCSV(reportData, 'reporte_movimientos_' + new Date().toISOString().split('T')[0]);
    showNotification('success', 'Reporte de movimientos descargado exitosamente');
  };

  const generateValuationReport = () => {
    const reportData = products.map(product => {
      const totalValue = product.stock * product.price;
      return {
        'Producto': product.name,
        'SKU': product.sku,
        'Categoría': product.category,
        'Stock': product.stock,
        'Precio Unitario': formatCurrency(product.price),
        'Valor Total': formatCurrency(totalValue),
        'Porcentaje del Total': ((totalValue / totalValue) * 100).toFixed(2) + '%'
      };
    });

    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    reportData.push({
      'Producto': '--- TOTAL INVENTARIO ---',
      'SKU': '',
      'Categoría': '',
      'Stock': products.reduce((sum, p) => sum + p.stock, 0),
      'Precio Unitario': '',
      'Valor Total': formatCurrency(totalInventoryValue),
      'Porcentaje del Total': '100.00%'
    });

    downloadCSV(reportData, 'reporte_valorizacion_' + new Date().toISOString().split('T')[0]);
    showNotification('success', 'Reporte de valorización descargado exitosamente');
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import functionality
  const handleImportProducts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const importedProducts: Product[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length < headers.length) continue;
          
          const product: Product = {
            id: Date.now().toString() + i,
            name: values[headers.indexOf('Producto')] || '',
            sku: values[headers.indexOf('SKU')] || generateSKU(values[0] || '', values[2] || ''),
            category: values[headers.indexOf('Categoría')] || 'Sin categoría',
            stock: parseInt(values[headers.indexOf('Stock Actual')]) || 0,
            minStock: parseInt(values[headers.indexOf('Stock Mínimo')]) || 5,
            price: parseFloat(values[headers.indexOf('Precio Unitario')]?.replace(/[^0-9.-]/g, '')) || 0,
            supplier: values[headers.indexOf('Proveedor')] || 'Sin especificar',
            lastUpdated: new Date().toISOString().split('T')[0],
            status: 'in-stock'
          };
          
          importedProducts.push(updateProductStatus(product));
        }
        
        setProducts(prev => [...prev, ...importedProducts]);
        showNotification('success', `${importedProducts.length} productos importados exitosamente`);
      } catch (error) {
        showNotification('error', 'Error al importar el archivo. Verifica el formato CSV.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'movements', label: 'Movimientos', icon: ShoppingCart },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'analytics', label: 'Análisis', icon: PieChart },
  ];

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Inventarios</h1>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Última actualización: {new Date().toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Inventario activo</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">Requiere reposición</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agotados</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">Reposición urgente</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Valor del inventario</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-3">
            {products.filter(p => p.status === 'low-stock' || p.status === 'out-of-stock').slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock} / Mín: {product.minStock}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {getStatusText(product.status)}
                </span>
              </div>
            ))}
            {products.filter(p => p.status === 'low-stock' || p.status === 'out-of-stock').length === 0 && (
              <p className="text-gray-500 text-center py-4">¡Todos los productos tienen stock adecuado!</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos Recientes</h3>
          <div className="space-y-3">
            {movements.slice(0, 5).map(movement => (
              <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {movement.type === 'entrada' ? 
                      <TrendingUp className="w-4 h-4 text-green-600" /> : 
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{movement.productName}</p>
                    <p className="text-sm text-gray-600">{movement.type === 'entrada' ? '+' : '-'}{movement.quantity} unidades</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{movement.date}</span>
              </div>
            ))}
            {movements.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay movimientos registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ProductsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={generateStockReport}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <label className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Importar
            <input
              type="file"
              accept=".csv"
              onChange={handleImportProducts}
              className="hidden"
            />
          </label>
          <button 
            onClick={() => setShowAddProduct(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => {
                  console.log('Search input changed:', e.target.value);
                  setSearchTerm(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Box className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.supplier}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span>{product.stock} unidades</span>
                      <span className="text-xs text-gray-500">Mín: {product.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowViewProduct(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setShowEditProduct(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setNewMovement(prev => ({ ...prev, productId: product.id }));
                          setShowMovementModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                        title="Registrar movimiento"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const MovementsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={generateMovementsReport}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button 
            onClick={() => setShowMovementModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Anterior</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Nuevo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      movement.type === 'entrada' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                    }`}>
                      {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.previousStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.newStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ReportsContent = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes e Informes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reporte de Stock</h3>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 mb-4">Estado actual del inventario por categorías y productos</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>• {totalProducts} productos totales</p>
            <p>• {categories.length - 1} categorías</p>
            <p>• Incluye stock actual y mínimo</p>
          </div>
          <button 
            onClick={generateStockReport}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Descargar CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Movimientos</h3>
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 mb-4">Historial completo de entradas y salidas de inventario</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>• {movements.length} movimientos registrados</p>
            <p>• Incluye stock anterior y nuevo</p>
            <p>• Trazabilidad completa</p>
          </div>
          <button 
            onClick={generateMovementsReport}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Descargar CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Valorización</h3>
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-gray-600 mb-4">Valor total del inventario por producto y categoría</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>• Valor total: {formatCurrency(totalValue)}</p>
            <p>• Precio unitario y total</p>
            <p>• Porcentaje por producto</p>
          </div>
          <button 
            onClick={generateValuationReport}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
          >
            Descargar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instrucciones para Reportes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Formato de Archivos</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Los reportes se descargan en formato CSV</li>
              <li>• Compatible con Excel y Google Sheets</li>
              <li>• Codificación UTF-8 para caracteres especiales</li>
              <li>• Separador de columnas: coma (,)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Importación de Productos</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Usa el botón "Importar" en la sección Productos</li>
              <li>• Formato requerido: CSV con columnas específicas</li>
              <li>• Columnas: Producto, SKU, Categoría, Stock Actual, Stock Mínimo, Precio Unitario, Proveedor</li>
              <li>• Los SKU se generan automáticamente si no se proporcionan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsContent = () => {
    const categoryStats = categories.filter(cat => cat !== 'all').map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
      return {
        category,
        products: categoryProducts.length,
        totalStock,
        totalValue,
        avgPrice: categoryProducts.length > 0 ? totalValue / totalStock : 0
      };
    });

    const topProducts = products
      .sort((a, b) => (b.stock * b.price) - (a.stock * a.price))
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Análisis y Métricas</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos de Mayor Valor</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <span className="text-sm text-gray-900">{product.name}</span>
                      <p className="text-xs text-gray-500">{product.stock} unidades</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(product.stock * product.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Categoría</h3>
            <div className="space-y-4">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{stat.category}</span>
                    <span className="text-sm text-gray-600">{stat.products} productos</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Stock total: {stat.totalStock}</span>
                    <span>Valor: {formatCurrency(stat.totalValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Generales</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock promedio por producto</span>
                <span className="text-sm font-medium text-gray-900">
                  {totalProducts > 0 ? Math.round(products.reduce((sum, p) => sum + p.stock, 0) / totalProducts) : 0} unidades
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Precio promedio</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(totalProducts > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Productos críticos</span>
                <span className="text-sm font-medium text-red-600">{outOfStockProducts + lowStockProducts}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Movimientos hoy</span>
                <span className="text-sm font-medium text-gray-900">
                  {movements.filter(m => m.date === new Date().toISOString().split('T')[0]).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Entradas totales</span>
                <span className="text-sm font-medium text-green-600">
                  {movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Salidas totales</span>
                <span className="text-sm font-medium text-red-600">
                  {movements.filter(m => m.type === 'salida').reduce((sum, m) => sum + m.quantity, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última actualización</span>
                <span className="text-sm font-medium text-gray-900">
                  {products.length > 0 ? products.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0].lastUpdated : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Productos activos</span>
                <span className="text-sm font-medium text-green-600">
                  {products.filter(p => p.status === 'in-stock').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Alertas pendientes</span>
                <span className="text-sm font-medium text-yellow-600">
                  {lowStockProducts + outOfStockProducts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent />;
      case 'products': return <ProductsContent />;
      case 'movements': return <MovementsContent />;
      case 'reports': return <ReportsContent />;
      case 'analytics': return <AnalyticsContent />;
      default: return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'info' && <AlertTriangle className="w-5 h-5 mr-2" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">DataStock</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Usuario Demo</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('es-CO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </div>

      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-center py-2 z-40">
        <p className="text-sm font-medium">
          🚀 DEMO FUNCIONAL - Sistema de Gestión de Inventarios DataStock Solutions
          <span className="ml-4 text-xs opacity-75">Todas las funcionalidades están operativas</span>
        </p>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Producto</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del producto *"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="SKU (opcional - se genera automáticamente)"
                value={newProduct.sku}
                onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar categoría *</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stock inicial *"
                value={newProduct.stock}
                onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Stock mínimo (opcional - por defecto 5)"
                value={newProduct.minStock}
                onChange={(e) => setNewProduct(prev => ({ ...prev, minStock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Precio *"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Proveedor (opcional)"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setNewProduct({
                    name: '',
                    sku: '',
                    category: '',
                    stock: '',
                    minStock: '',
                    price: '',
                    supplier: '',
                    description: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Producto</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="SKU"
                value={editingProduct.sku}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, sku: e.target.value }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select 
                value={editingProduct.category}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stock actual"
                value={editingProduct.stock}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, stock: parseInt(e.target.value) || 0 }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Stock mínimo"
                value={editingProduct.minStock}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, minStock: parseInt(e.target.value) || 0 }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Precio"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, price: parseFloat(e.target.value) || 0 }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Proveedor"
                value={editingProduct.supplier}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, supplier: e.target.value }) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="Descripción"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditProduct(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditProduct}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewProduct && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Producto</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900">{selectedProduct.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">SKU</label>
                <p className="text-gray-900">{selectedProduct.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Categoría</label>
                <p className="text-gray-900">{selectedProduct.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock Actual</label>
                  <p className="text-gray-900">{selectedProduct.stock} unidades</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock Mínimo</label>
                  <p className="text-gray-900">{selectedProduct.minStock} unidades</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Precio</label>
                <p className="text-gray-900">{formatCurrency(selectedProduct.price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Valor Total en Stock</label>
                <p className="text-gray-900 font-semibold">{formatCurrency(selectedProduct.stock * selectedProduct.price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Proveedor</label>
                <p className="text-gray-900">{selectedProduct.supplier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct.status)}`}>
                  {getStatusText(selectedProduct.status)}
                </span>
              </div>
              {selectedProduct.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-900">{selectedProduct.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Última Actualización</label>
                <p className="text-gray-900">{selectedProduct.lastUpdated}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowViewProduct(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowViewProduct(false);
                  setEditingProduct(selectedProduct);
                  setShowEditProduct(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Movimiento</h3>
            <div className="space-y-4">
              <select 
                value={newMovement.productId}
                onChange={(e) => setNewMovement(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar producto *</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock})
                  </option>
                ))}
              </select>
              <select 
                value={newMovement.type}
                onChange={(e) => setNewMovement(prev => ({ ...prev, type: e.target.value as 'entrada' | 'salida' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="entrada">Entrada (Agregar stock)</option>
                <option value="salida">Salida (Reducir stock)</option>
              </select>
              <input
                type="number"
                placeholder="Cantidad *"
                value={newMovement.quantity}
                onChange={(e) => setNewMovement(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="Notas (opcional)"
                value={newMovement.notes}
                onChange={(e) => setNewMovement(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              {newMovement.productId && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Stock actual: <span className="font-medium">{products.find(p => p.id === newMovement.productId)?.stock || 0}</span>
                  </p>
                  {newMovement.quantity && (
                    <p className="text-sm text-gray-600">
                      Stock después del movimiento: 
                      <span className="font-medium ml-1">
                        {newMovement.type === 'entrada' 
                          ? (products.find(p => p.id === newMovement.productId)?.stock || 0) + parseInt(newMovement.quantity)
                          : (products.find(p => p.id === newMovement.productId)?.stock || 0) - parseInt(newMovement.quantity)
                        }
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMovementModal(false);
                  setNewMovement({
                    productId: '',
                    type: 'entrada',
                    quantity: '',
                    notes: ''
                  });
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMovement}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;