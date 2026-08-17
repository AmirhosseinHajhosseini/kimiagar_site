'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './molecular-drawer.module.css';
import Canvas, { type CanvasRef } from './Canvas';
import type { ToolType } from './types';

type ExportFormat = 'svg' | 'png' | 'json';

type ToolItem = {
  id: ToolType;
  label: string;
  icon: string;
};

export default function MolecularDrawer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<CanvasRef | null>(null);

  const [selectedTool, setSelectedTool] =
    useState<ToolType>('atom');

  const [selectedElement, setSelectedElement] =
    useState<string>('C');

  const [customElementInput, setCustomElementInput] =
    useState<string>('C');

  const [isFullScreen, setIsFullScreen] =
    useState<boolean>(false);

  const [canUndo, setCanUndo] =
    useState<boolean>(false);

  const [canRedo, setCanRedo] =
    useState<boolean>(false);

  const [showToolPanel, setShowToolPanel] =
    useState<boolean>(false);

  const [showElementPanel, setShowElementPanel] =
    useState<boolean>(false);

  const elements = useMemo(
    () => [
      'C',
      'H',
      'O',
      'N',
      'S',
      'P',
      'F',
      'Cl',
      'Br',
      'I',
      'Si',
      'B',
      'Na',
      'K',
      'Li',
      'Mg',
      'Ca',
      'Al',
      'Fe',
      'Cu',
      'Zn',
      'Ag',
    ],
    [],
  );

  const baseTools: ToolItem[] = [
    { id: 'select', label: 'انتخاب', icon: '⌖' },
    { id: 'atom', label: 'اتم', icon: selectedElement },
    { id: 'text', label: 'متن', icon: 'T' },
    { id: 'erase', label: 'پاک‌کن', icon: '⌫' },
  ];

  const bondTools: ToolItem[] = [
    { id: 'single-bond', label: 'پیوند یگانه', icon: '—' },
    { id: 'double-bond', label: 'پیوند دوگانه', icon: '＝' },
    { id: 'triple-bond', label: 'پیوند سه‌گانه', icon: '≡' },
    { id: 'wedge-bond', label: 'پیوند گوه‌ای', icon: '▲' },
    { id: 'dash-bond', label: 'پیوند هاشور', icon: '▤' },
    { id: 'wavy-bond', label: 'پیوند موجی', icon: '〰' },
  ];

  const ringTools: ToolItem[] = [
    { id: 'benzene-ring', label: 'حلقه بنزن', icon: '⬡' },
    { id: 'cyclopentane-ring', label: 'سیکلوپنتان', icon: '⬠' },
    { id: 'cyclohexane-ring', label: 'سیکلوهگزان', icon: '⬢' },
    { id: 'chair-conformation', label: 'صورت‌بندی صندلی', icon: '⌁' },
    { id: 'boat-conformation', label: 'صورت‌بندی قایقی', icon: '⌒' },
  ];

  const electronTools: ToolItem[] = [
    { id: 'lone-pair', label: 'جفت الکترون ناپیوندی', icon: '••' },
    { id: 'radical', label: 'رادیکال', icon: '•' },
    { id: 'positive-charge', label: 'بار مثبت', icon: '+' },
    { id: 'negative-charge', label: 'بار منفی', icon: '−' },
  ];

  const arrowTools: ToolItem[] = [
    { id: 'reaction-arrow', label: 'فلش واکنش', icon: '→' },
    { id: 'equilibrium-arrow', label: 'فلش تعادل', icon: '⇌' },
    { id: 'resonance-arrow', label: 'فلش رزونانس', icon: '↔' },
    { id: 'retro-arrow', label: 'فلش رترو', icon: '⇒' },
    { id: 'curved-arrow', label: 'فلش خمیده الکترونی', icon: '↷' },
    { id: 'fishhook-arrow', label: 'فلش ماهیگیری', icon: '↝' },
  ];

  const annotationTools: ToolItem[] = [
    { id: 'bracket', label: 'براکت', icon: '[ ]' },
    { id: 'transition-state', label: 'حالت گذار', icon: '‡' },
    { id: 'bonding-pair', label: 'جفت الکترون پیوندی', icon: ':' },
    { id: 'partial-positive', label: 'بار جزئی مثبت', icon: 'δ+' as never },
    { id: 'partial-negative', label: 'بار جزئی منفی', icon: 'δ−' as never },
  ] as unknown as ToolItem[];

  const applyElement = useCallback((value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    setSelectedElement(cleaned);
    setCustomElementInput(cleaned);
    setSelectedTool('atom');
    setShowElementPanel(false);
  }, []);

  const toggleFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = Boolean(document.fullscreenElement);
      setIsFullScreen(fullscreen);
      if (!fullscreen) {
        setShowToolPanel(false);
        setShowElementPanel(false);
      }
    };

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      );
    };
  }, []);

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      'آیا از پاک‌کردن کامل بوم اطمینان دارید؟',
    );
    if (confirmed) {
      canvasRef.current?.clear();
    }
  };

  const handleExport = (format: ExportFormat) => {
    canvasRef.current?.exportAs(format);
  };

  const handleHistoryChange = (history: {
    canUndo: boolean;
    canRedo: boolean;
  }) => {
    setCanUndo(history.canUndo);
    setCanRedo(history.canRedo);
  };

  const renderToolButton = (tool: ToolItem) => {
    const isActive = selectedTool === tool.id;

    return (
      <button
        key={tool.id}
        type="button"
        title={tool.label}
        aria-label={tool.label}
        aria-pressed={isActive}
        className={`${styles.toolButton} ${
          isActive ? styles.activeTool : ''
        }`}
        onClick={() => {
          setSelectedTool(tool.id);
          setShowToolPanel(false);

          if (tool.id === 'atom' && isFullScreen) {
            setShowElementPanel(true);
          }
        }}
      >
        <span className={styles.toolIcon}>{tool.icon}</span>
        <span className={styles.toolLabel}>{tool.label}</span>
      </button>
    );
  };

  const renderToolGroup = (
    title: string,
    tools: ToolItem[],
  ) => (
    <section className={styles.toolGroup}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.toolGrid}>
        {tools.map(renderToolButton)}
      </div>
    </section>
  );

  return (
    <main
      ref={containerRef}
      dir="rtl"
      className={`${styles.container} ${
        isFullScreen ? styles.fullscreenContainer : ''
      }`}
    >
      {!isFullScreen && (
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Molecular Drawer</h1>
            <p className={styles.subtitle}>
              ابزار حرفه‌ای رسم ساختار و مکانیسم شیمی آلی
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerButton}
              onClick={handleUndo}
              disabled={!canUndo}
            >
              ↶ بازگشت
            </button>

            <button
              type="button"
              className={styles.headerButton}
              onClick={handleRedo}
              disabled={!canRedo}
            >
              ↷ تکرار
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={toggleFullScreen}
            >
              ⛶ تمام‌صفحه
            </button>
          </div>
        </header>
      )}

      <section
        className={`${isFullScreen ? styles.fullscreenLayout : styles.layout} ${styles.lowerContent}`}
      >
        {!isFullScreen && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>ابزارها</h2>
            </div>

            {renderToolGroup('ابزارهای پایه', baseTools)}
            {renderToolGroup('پیوندها', bondTools)}
            {renderToolGroup('حلقه‌ها', ringTools)}
            {renderToolGroup('الکترون و بار', electronTools)}
            {renderToolGroup('فلش‌ها', arrowTools)}
            {renderToolGroup('یادداشت و نشانه‌ها', annotationTools)}
          </aside>
        )}

        <section className={styles.canvasSection}>
          <div className={styles.canvasHeader}>
            <div>
              <h2 className={styles.panelTitle}>بوم رسم</h2>
              <span className={styles.selectedToolText}>
                ابزار فعال: {selectedTool}
                {selectedTool === 'atom' ? ` (${selectedElement})` : ''}
              </span>
            </div>

            <div className={styles.canvasActions}>
              {!isFullScreen && (
                <button
                  type="button"
                  className={styles.headerButton}
                  onClick={() => setShowElementPanel((v) => !v)}
                >
                  عنصر: {selectedElement}
                </button>
              )}

              <button
                type="button"
                className={styles.iconButton}
                onClick={handleClear}
                title="پاک‌کردن بوم"
              >
                🗑
              </button>

              <button
                type="button"
                className={styles.iconButton}
                onClick={toggleFullScreen}
                title={
                  isFullScreen
                    ? 'خروج از تمام‌صفحه'
                    : 'تمام‌صفحه'
                }
              >
                {isFullScreen ? '×' : '⛶'}
              </button>
            </div>
          </div>

          {!isFullScreen && showElementPanel && (
            <div className={styles.inlineElementPanel}>
              <div className={styles.elementPanelHeader}>
                <strong>انتخاب اتم</strong>
              </div>

              <div className={styles.elementGrid}>
                {elements.map((element) => (
                  <button
                    key={element}
                    type="button"
                    className={`${styles.elementButton} ${
                      selectedElement === element
                        ? styles.activeElement
                        : ''
                    }`}
                    onClick={() => applyElement(element)}
                  >
                    {element}
                  </button>
                ))}
              </div>

              <div className={styles.customElementRow}>
                <input
                  type="text"
                  value={customElementInput}
                  onChange={(e) =>
                    setCustomElementInput(e.target.value)
                  }
                  placeholder="مثلاً: Se ، Ti ، R"
                  className={styles.elementInput}
                />
                <button
                  type="button"
                  className={styles.applyElementButton}
                  onClick={() => applyElement(customElementInput)}
                >
                  اعمال
                </button>
              </div>
            </div>
          )}

          <div className={styles.canvasWrapper}>
            <Canvas
              ref={canvasRef}
              selectedTool={selectedTool}
              selectedElement={selectedElement}
              onHistoryChange={handleHistoryChange}
              isFullScreen={isFullScreen}
            />
          </div>

          {isFullScreen && (
            <div className={styles.floatingDock}>
              <button
                type="button"
                className={styles.dockButton}
                onClick={() => {
                  setShowToolPanel((value) => !value);
                  setShowElementPanel(false);
                }}
                title="نمایش ابزارها"
              >
                ☰
              </button>

              <button
                type="button"
                className={styles.dockButton}
                onClick={() => {
                  setSelectedTool('atom');
                  setShowElementPanel((value) => !value);
                  setShowToolPanel(false);
                }}
                title="انتخاب اتم"
              >
                {selectedElement}
              </button>

              <button
                type="button"
                className={styles.dockButton}
                onClick={handleUndo}
                disabled={!canUndo}
                title="بازگشت"
              >
                ↶
              </button>

              <button
                type="button"
                className={styles.dockButton}
                onClick={handleRedo}
                disabled={!canRedo}
                title="تکرار"
              >
                ↷
              </button>

              <button
                type="button"
                className={styles.dockButton}
                onClick={handleClear}
                title="پاک‌کردن"
              >
                🗑
              </button>

              <button
                type="button"
                className={styles.dockButton}
                onClick={toggleFullScreen}
                title="خروج از تمام‌صفحه"
              >
                ×
              </button>
            </div>
          )}

          {isFullScreen && showToolPanel && (
            <div className={styles.floatingToolPanel}>
              <div className={styles.floatingPanelHeader}>
                <strong>ابزارهای رسم</strong>
                <button
                  type="button"
                  onClick={() => setShowToolPanel(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              {renderToolGroup('ابزارهای پایه', baseTools)}
              {renderToolGroup('پیوندها', bondTools)}
              {renderToolGroup('حلقه‌ها', ringTools)}
              {renderToolGroup('الکترون و بار', electronTools)}
              {renderToolGroup('فلش‌ها', arrowTools)}
              {renderToolGroup('یادداشت و نشانه‌ها', annotationTools)}
            </div>
          )}

          {isFullScreen && showElementPanel && (
            <div className={styles.floatingElementPanel}>
              <div className={styles.floatingPanelHeader}>
                <strong>انتخاب اتم</strong>
                <button
                  type="button"
                  onClick={() => setShowElementPanel(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <div className={styles.elementGrid}>
                {elements.map((element) => (
                  <button
                    key={element}
                    type="button"
                    className={`${styles.elementButton} ${
                      selectedElement === element
                        ? styles.activeElement
                        : ''
                    }`}
                    onClick={() => applyElement(eleme)}
                  >
                    {element}
                  </button>
                ))}
              </div>

              <div className={styles.customElementRow}>
                <input
                  type="text"
                  value={customElementInput}
                  onChange={(e) =>
                    setCustomElementInput(e.target.value)
                  }
                  placeholder="مثلاً: Se ، Ti ، R ، Me"
                  className={styles.elementInput}
                />
                <button
                  type="button"
                  className={styles.applyElementButton}
                  onClick={() => applyElement(customElementInput)}
                >
                  اعمال
                </button>
              </div>
            </div>
          )}
        </section>

        {!isFullScreen && (
          <aside className={styles.propertiesPanel}>
            <div className={styles.sidebarHeader}>
              <h2>تنظیمات</h2>
            </div>

            <div className={styles.propertySection}>
              <h3 className={styles.groupTitle}>عنصر فعال</h3>

              <div className={styles.elementGrid}>
                {elements.map((element) => (
                  <button
                    key={element}
                    type="button"
                    className={`${styles.elementButton} ${
                      selectedElement === element
                        ? styles.activeElement
                        : ''
                    }`}
                    onClick={() => applyElement(element)}
                  >
                    {element}
                  </button>
                ))}
              </div>

              <div className={styles.customElementRow}>
                <input
                  type="text"
                  value={customElementInput}
                  onChange={(e) =>
                    setCustomElementInput(e.target.value)
                  }
                  placeholder="مثلاً: Se ، Ti ، R"
                  className={styles.elementInput}
                />
                <button
                  type="button"
                  className={styles.applyElementButton}
                  onClick={() => applyElement(customElementInput)}
                >
                  اعمال
                </button>
              </div>
            </div>

            <div className={styles.propertySection}>
              <h3 className={styles.groupTitle}>خروجی</h3>

              <div className={styles.exportButtons}>
                <button
                  type="button"
                  onClick={() => handleExport('svg')}
                >
                  خروجی SVG
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('png')}
                >
                  خروجی PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                >
                  ذخیره JSON
                </button>
              </div>
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}
