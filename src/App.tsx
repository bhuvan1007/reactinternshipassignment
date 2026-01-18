import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Artwork, ApiResponse } from './types';

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const [deselectedRowIds, setDeselectedRowIds] = useState<Set<number>>(new Set());
  /* New State for Logic-Based Selection */
  const [customSelectionTotal, setCustomSelectionTotal] = useState<number>(0);
  const [selectCount, setSelectCount] = useState<string>('');

  /* 
   * CRITICAL: Use a ref to track the latest 'customSelectionTotal' value.
   * This bypasses any stale closure issues inside callbacks (like onSelectionChange)
   * that might be cached by PrimeReact or React rendering cycles.
   * Without this, the callback might see '0' instead of '15', causing logic errors.
   */
  const customTotalRef = useRef<number>(customSelectionTotal);

  // Update ref whenever state changes
  useEffect(() => {
    customTotalRef.current = customSelectionTotal;
  }, [customSelectionTotal]);

  const overlayRef = useRef<OverlayPanel>(null);
  const rowsPerPage = 12;

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  const fetchArtworks = async (page: number): Promise<void> => {
    setLoading(true);
    try {
      /* 
       * CRITICAL: Enforce limit=12 to match our 'rowsPerPage' constant.
       * If the API returns a different default (e.g. 25), our global index
       * calculation will collide across pages, causing severe selection bugs.
       */
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`);
      const data: ApiResponse = await response.json();

      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  /* Helper to check if a row is selected based on our logic */
  const isRowSelected = (rowId: number, rowIndex: number): boolean => {
    // 1. If explicitly deselected, it's NOT selected (overrides all)
    if (deselectedRowIds.has(rowId)) return false;

    // 2. If explicitly selected, it IS selected
    if (selectedRowIds.has(rowId)) return true;

    // 3. Logic-based selection:
    // Calculate global index of this row
    const globalIndex = (currentPage - 1) * rowsPerPage + rowIndex;

    // If it falls within the custom requested count
    return globalIndex < customSelectionTotal;
  };

  const onSelectionChange = (e: any): void => {
    // e.value contains the array of currently selected objects on THIS page
    const currentSelectedOnPage = e.value as Artwork[];
    const currentSelectedIds = new Set(currentSelectedOnPage.map(a => a.id));

    // Create clones of current state to modify
    const nextSelectedIds = new Set(selectedRowIds);
    const nextDeselectedIds = new Set(deselectedRowIds);

    // Get the FRESH value from ref
    const currentCustomTotal = customTotalRef.current;

    // Loop through ALL items on the current page to determine changes
    artworks.forEach((artwork, index) => {
      const isSelectedNow = currentSelectedIds.has(artwork.id);

      // Calculate if it SHOULD be selected by the "Global Count" rule
      const globalIndex = (currentPage - 1) * rowsPerPage + index;
      const autoSelectedByRule = globalIndex < currentCustomTotal;

      if (isSelectedNow) {
        // User (or logic) wants this selected.
        if (autoSelectedByRule) {
          // If it's auto-selected, ensure it's NOT in 'deselectedRowIds'
          if (nextDeselectedIds.has(artwork.id)) {
            nextDeselectedIds.delete(artwork.id);
          }
        } else {
          // If it's NOT auto-selected, it MUST be in 'selectedRowIds'
          if (!nextSelectedIds.has(artwork.id)) {
            nextSelectedIds.add(artwork.id);
          }
        }
      } else {
        // User wants this DE-selected (it's NOT in e.value).
        if (autoSelectedByRule) {
          // If it WAS auto-selected, we must add to 'deselectedRowIds' to block it
          if (!nextDeselectedIds.has(artwork.id)) {
            nextDeselectedIds.add(artwork.id);
          }
        } else {
          // If it wasn't auto-selected, we just ensure it's removed from 'selectedRowIds'
          if (nextSelectedIds.has(artwork.id)) {
            nextSelectedIds.delete(artwork.id);
          }
        }
      }
    });

    // Apply batched updates
    setSelectedRowIds(nextSelectedIds);
    setDeselectedRowIds(nextDeselectedIds);
  };

  const getSelectedArtworks = (): Artwork[] => {
    return artworks.filter((artwork, index) => isRowSelected(artwork.id, index));
  };

  const isAllSelected = (): boolean => {
    return artworks.length > 0 && artworks.every((artwork, index) => isRowSelected(artwork.id, index));
  };

  const onSelectAllChange = (e: any): void => {
    const currentPageIds = artworks.map(artwork => artwork.id);

    if (e.checked) {
      // "Select All" on current page
      currentPageIds.forEach(id => {
        // Force select
        setSelectedRowIds(prev => new Set(prev).add(id));
        // Remove any deselect block
        if (deselectedRowIds.has(id)) {
          setDeselectedRowIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      });
    } else {
      // "Unselect All" on current page
      currentPageIds.forEach(id => {
        // If was auto-selected, block it
        setDeselectedRowIds(prev => new Set(prev).add(id));
        // Remove from manual select if present
        if (selectedRowIds.has(id)) {
          setSelectedRowIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      });
    }
  };

  const handleCustomRowSelection = (): void => {
    const count = parseInt(selectCount);

    if (isNaN(count) || count < 0) {
      alert('Please enter a valid number');
      return;
    }

    // Force clear everything to start fresh compliant state
    setSelectedRowIds(new Set());
    setDeselectedRowIds(new Set());
    setCustomSelectionTotal(count);
    // Explicitly update ref immediately just in case of weird race before next render?
    // Not strictly needed if state update triggers effect, but conceptually safe.
    customTotalRef.current = count;

    overlayRef.current?.hide();
    setSelectCount('');
  };

  const showCustomSelectionPanel = (event: React.MouseEvent): void => {
    overlayRef.current?.toggle(event);
  };

  // Custom body templates
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
          <span className="selected-count">
            Selected: {customSelectionTotal + selectedRowIds.size - deselectedRowIds.size} rows
          </span>
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

        <div className="custom-horizontal-pagination">
          <button
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="pi pi-angle-left"></i>
          </button>

          {Array.from({ length: Math.min(5, Math.ceil(totalRecords / rowsPerPage)) }, (_, i) => {
            const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            if (pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className={`pagination-btn ${currentPage === Math.ceil(totalRecords / rowsPerPage) ? 'disabled' : ''}`}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalRecords / rowsPerPage)}
          >
            <i className="pi pi-angle-right"></i>
          </button>
        </div>
      </div>

      <footer className="gallery-footer" style={{ marginTop: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
        <p>Art Institute of Chicago API • Designed with React</p>
      </footer>
    </div>
  );
};

export default App;