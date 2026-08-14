"use client";

import React, { useState } from 'react';
import { elementsList, ElementData } from '@/data/elements';
import styles from './periodic-table.module.css';

const PeriodicTable: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(elementsList.find(e => e.symbol === 'V') || elementsList[0]);

  // ایجاد شبکه جدول تناوبی (۱۸ ستون در ۷ ردیف)
  const renderElement = (el: ElementData) => {
    // محاسبه موقعیت در گرید بر اساس گروه و دوره
    const gridStyle = {
      gridColumn: el.group,
      gridRow: el.period + 1, // ردیف اول برای اطلاعات رزرو شده
    };

    return (
      <div 
        key={el.number}
        className={`${styles.elementCard} ${styles[el.category]} ${selectedElement?.number === el.number ? styles.active : ''}`}
        style={gridStyle}
        onClick={() => setSelectedElement(el)}
      >
        <span className={styles.atomicNumber}>{el.number}</span>
        <span className={styles.symbol}>{el.symbol}</span>
        <span className={styles.elementName}>{el.persianName}</span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* پنل جزئیات (مشابه بخش بالایی تصویر RSC) */}
      <div className={styles.detailPanel}>
        {selectedElement && (
          <div className={`${styles.infoCard} ${styles[selectedElement.category + 'Full']}`}>
            <div className={styles.mainInfo}>
              <h2 className={styles.hugeSymbol}>{selectedElement.symbol}</h2>
              <div className={styles.nameLabels}>
                <span className={styles.engName}>{selectedElement.name}</span>
                <span className={styles.perName}>{selectedElement.persianName}</span>
              </div>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <label>عدد اتمی</label>
                <span>{selectedElement.number}</span>
              </div>
              <div className={styles.statItem}>
                <label>جرم اتمی</label>
                <span>{selectedElement.weight}</span>
              </div>
              <div className={styles.statItem}>
                <label>الکترونگاتیوی</label>
                <span>{selectedElement.electronegativity || 'نامشخص'}</span>
              </div>
              <div className={styles.statItem}>
                <label>آرایش الکترونی</label>
                <span className={styles.configText}>{selectedElement.config}</span>
              </div>
              <div className={styles.statItem}>
                <label>انرژی یونش</label>
                <span>{selectedElement.ionization} kJ/mol</span>
              </div>
              <div className={styles.statItem}>
                <label>حالت فیزیکی</label>
                <span>{selectedElement.stateOfMatter}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* راهنمای دسته‌بندی‌ها */}
        <div className={styles.legend}>
          <div className={styles.legendItem}><span className={styles.alkali}></span> فلزات قلیایی</div>
          <div className={styles.legendItem}><span className={styles.transition}></span> فلزات واسطه</div>
          <div className={styles.legendItem}><span className={styles.noble}></span> گازهای نجیب</div>
          <div className={styles.legendItem}><span className={styles.metalloid}></span> شبه‌فلزات</div>
        </div>
      </div>

      {/* گرید اصلی جدول */}
      <div className={styles.tableGrid}>
        {elementsList.map(el => renderElement(el))}
        
        {/* نشانگر دوره‌ها (اعداد سمت چپ) */}
        {[1,2,3,4,5,6,7].map(p => (
          <div key={p} className={styles.periodLabel} style={{ gridRow: p + 1, gridColumn: 0 }}>{p}</div>
        ))}
      </div>
    </div>
  );
};

export default PeriodicTable;
