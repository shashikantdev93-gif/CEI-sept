import React from "react";
import { Table } from "react-bootstrap";

// Update the interface to add isHighlighted property
export interface DetailsField {
  label: string;
  value: React.ReactNode;
  isHighlighted?: boolean; // Add this line
}

interface DetailsTableProps {
  fields: DetailsField[];
}

const DetailsTable: React.FC<DetailsTableProps> = ({ fields }) => {
  // Split fields into rows of 2 label-value pairs (4 fields per row)
  const rows = [];
  for (let i = 0; i < fields.length; i += 2) {
    rows.push(fields.slice(i, i + 2));
  }

  return (
    <>
      {/* Desktop View */}
      <div className="d-none d-md-block">
        <Table className="mb-0 project-table sleek-project-table">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "35%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <tbody>
            {rows.map((row, idx) => (
              <tr className="sleek-project-tr" key={idx}>
                <td className="table-label sleek-project-td">{row[0]?.label || ""}</td>
                <td className="table-value sleek-project-td">
                  {/* Add highlighting logic here */}
                  {row[0]?.isHighlighted ? (
                    <strong className="project-pin">{row[0]?.value || ""}</strong>
                  ) : (
                    row[0]?.value || ""
                  )}
                </td>
                <td className="table-label sleek-project-td">{row[1]?.label || ""}</td>
                <td className="table-value sleek-project-td">
                  {/* Add highlighting logic here */}
                  {row[1]?.isHighlighted ? (
                    <strong className="project-pin">{row[1]?.value || ""}</strong>
                  ) : (
                    row[1]?.value || ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {/* Mobile View */}
      <div className="d-block d-md-none">
        {fields.map((field, idx) => (
          <div className="mobile-card-field" key={idx}>
            <div className="mobile-card-label">{field.label}</div>
            <div className="mobile-card-value">
              {/* Add highlighting logic for mobile view too */}
              {field.isHighlighted ? (
                <strong className="project-pin">{field.value}</strong>
              ) : (
                field.value
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DetailsTable;