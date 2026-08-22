"use client";

import React from "react";
import styles from "./MoleculeDrawer.module.css";

type Props = {
  selectedAtom: any;
  selectedBond: any;
  selectedRing: any;
  selectedStartAtom: any;
  selectedEndAtom: any;
  getElementData: (element: string) => { persianName: string };
  getBondTypeLabel: (bondType: string) => string;
  getRingLabel: (ringKind: string) => string;
  deleteAtom: (id: string) => void;
  deleteBond: (id: string) => void;
  deleteRing: (id: string, mode: "simple" | "structure") => void;
};

function PropRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={styles.propertyRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function MoleculePropertiesPanel({
  selectedAtom,
  selectedBond,
  selectedRing,
  selectedStartAtom,
  selectedEndAtom,
  getElementData,
  getBondTypeLabel,
  getRingLabel,
  deleteAtom,
  deleteBond,
  deleteRing,
}: Props) {
  return (
    <aside className={styles.propertiesPanel} aria-label="پنل ویژگی‌ها">
      <div className={styles.panelHeader}>
        <h2>ویژگی‌ها</h2>
      </div>

      {selectedAtom ? (
        <div className={styles.bondProperties}>
          <span className={styles.propertyBadge}>ATOM</span>
          <h3 className={styles.propertyTitle}>ویژگی‌های اتم</h3>

          <PropRow label="نماد عنصر" value={selectedAtom.element} />
          <PropRow
            label="نام عنصر"
            value={getElementData(selectedAtom.element).persianName}
          />
          <PropRow
            label="موقعیت X"
            value={Math.round(selectedAtom.position.x)}
          />
          <PropRow
            label="موقعیت Y"
            value={Math.round(selectedAtom.position.y)}
          />

          <button
            type="button"
            className={styles.propertyDeleteButton}
            onClick={() => deleteAtom(selectedAtom.id)}
          >
            حذف اتم
          </button>
        </div>
      ) : selectedBond ? (
        <div className={styles.bondProperties}>
          <span className={styles.propertyBadge}>BOND</span>
          <h3 className={styles.propertyTitle}>ویژگی‌های پیوند</h3>

          <PropRow
            label="نوع پیوند"
            value={getBondTypeLabel(selectedBond.bondType)}
          />
          <PropRow label="مرتبه پیوند" value={selectedBond.order} />
          <PropRow label="اتم اول" value={selectedStartAtom?.element ?? "-"} />
          <PropRow label="اتم دوم" value={selectedEndAtom?.element ?? "-"} />

          <button
            type="button"
            className={styles.propertyDeleteButton}
            onClick={() => deleteBond(selectedBond.id)}
          >
            حذف پیوند
          </button>
        </div>
      ) : selectedRing ? (
        <div className={styles.bondProperties}>
          <span className={styles.propertyBadge}>RING</span>
          <h3 className={styles.propertyTitle}>ویژگی‌های حلقه</h3>

          <PropRow label="نوع حلقه" value={getRingLabel(selectedRing.ringKind)} />
          <PropRow label="آروماتیک" value={selectedRing.aromatic ? "بله" : "خیر"} />
          <PropRow label="تعداد اتم‌ها" value={selectedRing.atomIds.length} />
          <PropRow label="تعداد پیوندها" value={selectedRing.bondIds.length} />
          <PropRow label="شعاع" value={Math.round(selectedRing.radius)} />

          <div className={styles.ringDeleteActions}>
            <button
              type="button"
              className={styles.propertyDeleteButton}
              onClick={() => deleteRing(selectedRing.id, "simple")}
            >
              حذف ساده حلقه
            </button>

            <button
              type="button"
              className={`${styles.propertyDeleteButton} ${styles.propertyDeleteStructureButton}`}
              onClick={() => deleteRing(selectedRing.id, "structure")}
            >
              حذف کل ساختار حلقه
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.emptyProperties}>
          <span className={styles.emptyPropertiesIcon}>◇</span>
          <p>شیئی انتخاب نشده است</p>
          <small>
            پس از انتخاب اتم، پیوند یا حلقه، ویژگی‌های آن نمایش داده می‌شود.
          </small>
        </div>
      )}
    </aside>
  );
}
