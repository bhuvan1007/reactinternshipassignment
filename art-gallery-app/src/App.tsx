import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Paginator } from 'primereact/paginator';
import { Artwork, ApiResponse } from './types';

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const [deselectedRowIds, setDeselectedRowIds] = useState<Set<number>>(new Set());
  const [selectCount, setSelectCount] = useState<string>('');
  
  const overlayRef = useRef<OverlayPanel>(null);
  const rowsPerPage = 12;

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  const fetchArtworks = async (page: number): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data: ApiResponse = await response.json();
      
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRowSelected = (rowId: number): boolean => {
    if (deselectedRowIds.has(rowId)) {
      return false;
    }
    return selectedRowIds.has(rowId);
  };

  const onSelectionChange = (e: any): void => {
    const selectedIds = new Set(e.value.map((artwork: Artwork) => artwork.id));
    const currentPageIds = new Set(artworks.map(artwork => artwork.id));
    
    // Update selected rows for current page
    currentPageIds.forEach(id => {
      if (selectedIds.has(id)) {
        setSelectedRowIds(prev => new Set(prev).add(id));
        setDeselectedRowIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        setDeselectedRowIds(prev => new Set(prev).add(id));
        setSelectedRowIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    });
  };

  const onSelectAllChange = (e: any): void => {
    const currentPageIds = artworks.map(artwork => artwork.id);
    
    if (e.checked) {
      // Select all on current page
      currentPageIds.forEach(id => {
        setSelectedRowIds(prev => new Set(prev).add(id));
        setDeselectedRowIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
    } else {
      // Deselect all on current page
      currentPageIds.forEach(id => {
        setDeselectedRowIds(prev => new Set(prev).add(id));
        setSelectedRowIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
    }
  };

  const getSelectedArtworks = (): Artwork[] => {
    return artworks.filter(artwork => isRowSelected(artwork.id));
  };

  const isAllSelected = (): boolean => {
    return artworks.length > 0 && artworks.every(artwork => isRowSelected(artwork.id));
  };

  const isIndeterminate = (): boolean => {
    const selectedCount = artworks.filter(artwork => isRowSelected(artwork.id)).length;
    return selectedCount > 0 && selectedCount < artworks.length;
  };

  const onPageChange = (event: any): void => {
    setCurrentPage(event.page + 1);
  };

  const handleCustomRowSelection = (): void => {
    const count = parseInt(selectCount);
    
    if (!count || count <= 0) {
      alert('Please enter a valid number');
      return;
    }

    // Strategy: Calculate which rows should be selected based on sequential IDs
    // without fetching data from other pages
    const newSelectedIds = new Set<number>();
    const newDeselectedIds = new Set<number>();
    
    // Calculate the range of IDs to select based on the pattern from current page
    // This assumes sequential ID pattern which we can extrapolate
    if (artworks.length > 0) {
      const firstId = artworks[0].id;
      const lastId = artworks[artworks.length - 1].id;
      const idsPerPage = artworks.length;
      
      // Calculate starting ID based on current page
      const pageOffset = (currentPage - 1) * idsPerPage;
      let selectedCount = 0;
      
      // Select rows starting from the first available ID
      for (let i = 0; i < count && selectedCount < count; i++) {
        // Calculate the expected ID for this position
        const expectedId = firstId - pageOffset + i;
        if (expectedId > 0) {
          newSelectedIds.add(expectedId);
          selectedCount++;
        }
      }
    }
    
    // Clear previous selections and apply new ones
    setSelectedRowIds(newSelectedIds);
    setDeselectedRowIds(newDeselectedIds);
    overlayRef.current?.hide();
    setSelectCount('');
  };

  const showCustomSelectionPanel = (event: React.MouseEvent): void => {
    overlayRef.current?.toggle(event);
  };

  // Custom body templates for better formatting
  const titleBodyTemplate = (rowData: Artwork) => {
    return (
      <div className="title-cell">
        <span className="artwork-title">{rowData.title || 'Untitled'}</span>
      </div>
    );
  };

  const artistBodyTemplate = (rowData: Artwork) => {
    return (
      <div className="artist-cell">
        <span className="artist-name">{rowData.artist_display || 'Unknown Artist'}</span>
      </div>
    );
  };

  const inscriptionsBodyTemplate = (rowData: Artwork) => {
    return (
      <div className="inscriptions-cell">
        <span className="inscriptions-text">
          {rowData.inscriptions || 'N/A'}
        </span>
      </div>
    );
  };

  const dateBodyTemplate = (rowData: Artwork, field: 'date_start' | 'date_end') => {
    const date = rowData[field];
    return (
      <div className="date-cell">
        <span className="date-value">{date || '-'}</span>
      </div>
    );
  };

  return (
    <div className="art-gallery-container">
      {/* Main Header */}
      <div className="main-header">
        <h1 className="gallery-title">Art Institute of Chicago</h1>
        <p className="gallery-subtitle">Explore masterpieces from one of the world's premier art collections</p>
      </div>

      {/* Controls Header Section */}
      <div className="header-section">
        <div className="selection-info">
          <span className="selected-count">Selected: {selectedRowIds.size} rows</span>
        </div>
        
        <div className="controls-section">
          <Button 
            label="Custom Row Selection" 
            icon="pi pi-list"
            onClick={showCustomSelectionPanel}
            className="custom-selection-btn"
            size="small"
          />
          
          <OverlayPanel ref={overlayRef} showCloseIcon className="custom-overlay">
            <div className="overlay-content">
              <h4 className="overlay-title">Select Custom Number of Rows</h4>
              <div className="overlay-controls">
                <InputText
                  value={selectCount}
                  onChange={(e) => setSelectCount(e.target.value)}
                  placeholder="Enter number"
                  type="number"
                  min="1"
                  className="number-input"
                />
                <Button
                  label="Select"
                  onClick={handleCustomRowSelection}
                  size="small"
                  className="select-btn"
                />
              </div>
            </div>
          </OverlayPanel>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <DataTable
          value={artworks}
          loading={loading}
          selection={getSelectedArtworks()}
          onSelectionChange={onSelectionChange}
          selectAll={isAllSelected()}
          onSelectAllChange={onSelectAllChange}
          selectionMode="multiple"
          dataKey="id"
          className="professional-table"
          emptyMessage="No artworks found"
          stripedRows
          showGridlines
          size="small"
        >
          <Column 
            selectionMode="multiple" 
            headerStyle={{ width: '40px', textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            frozen
          />
          <Column 
            field="title" 
            header="TITLE" 
            sortable 
            body={titleBodyTemplate}
            headerStyle={{ minWidth: '250px' }}
            style={{ maxWidth: '300px' }}
          />
          <Column 
            field="place_of_origin" 
            header="PLACE OF ORIGIN" 
            sortable 
            headerStyle={{ minWidth: '120px' }}
            bodyStyle={{ textAlign: 'center' }}
          />
          <Column 
            field="artist_display" 
            header="ARTIST" 
            sortable 
            body={artistBodyTemplate}
            headerStyle={{ minWidth: '200px' }}
            style={{ maxWidth: '250px' }}
          />
          <Column 
            field="inscriptions" 
            header="INSCRIPTIONS" 
            body={inscriptionsBodyTemplate}
            headerStyle={{ minWidth: '150px' }}
            style={{ maxWidth: '200px' }}
          />
          <Column 
            field="date_start" 
            header="START DATE" 
            sortable 
            body={(rowData) => dateBodyTemplate(rowData, 'date_start')}
            headerStyle={{ minWidth: '100px' }}
            bodyStyle={{ textAlign: 'center' }}
          />
          <Column 
            field="date_end" 
            header="END DATE" 
            sortable 
            body={(rowData) => dateBodyTemplate(rowData, 'date_end')}
            headerStyle={{ minWidth: '100px' }}
            bodyStyle={{ textAlign: 'center' }}
          />
        </DataTable>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          <span className="showing-text">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRecords)} of {totalRecords} entries
          </span>
        </div>
        
        <Paginator
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          className="custom-paginator"
          template="PrevPageLink PageLinks NextPageLink"
        />
      </div>
    </div>
  );
};

export default App;
