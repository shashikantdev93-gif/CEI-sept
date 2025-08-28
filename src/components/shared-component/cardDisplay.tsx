import React from "react";
import { Row, Col, Card } from "react-bootstrap";

type Category = 'Project Site Applied' | 'Rejected' | 'Inbox' | 'Closed';


interface CardDisplayProps {
  stats: Array<{
    title: Category; 
    count: number;
    iconClass: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
  }>;
  selectedCategory: Category; 
  setSelectedCategory: (category: Category) => void;
  isMobileView: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  stats,
  selectedCategory,
  setSelectedCategory,
  isMobileView,
}) => (
  <Row className="g-3 justify-content-between">
    {stats.map((item, index) => (
      <Col
        key={index}
        xs={12}
        md={6}
        lg={3}
        className={`d-flex flex-column align-items-center ${
          isMobileView && selectedCategory !== item.title ? "d-none" : ""
        }`}
      >
        <Card
          onClick={
            !isMobileView
              ? () => setSelectedCategory(item.title) 
              : undefined
          }
          className={`border-0 shadow-sm w-100 stat-card ${
            selectedCategory === item.title
              ? "selected-card"
              : "non-selected-card"
          }`}
          style={{
            maxWidth: "300px",
            minHeight: "100px",
            backgroundColor:
              selectedCategory === item.title
                ? item.textColor
                : item.bgColor,
            borderRadius: "10px",
            border: "none",
            borderBottom:
              selectedCategory === item.title
                ? `4px solid ${item.textColor}`
                : "none",
            transition: "all 0.3s ease-in-out",
            cursor: !isMobileView ? "pointer" : "default",
          }}
        >
          <Card.Body className="d-flex align-items-center gap-3 p-3">
            <i
              className={`${item.iconClass} stat-icon`}
              style={{
                fontSize: "30px",
                color:
                  selectedCategory === item.title
                    ? "#ffffff"
                    : item.iconColor,
              }}
            ></i>
            <div>
              <Card.Title
                className="mb-1 small fw-medium"
                style={{
                  fontSize: "14px",
                  color:
                    selectedCategory === item.title
                      ? "#ffffff"
                      : item.textColor,
                }}
              >
                {item.title}
              </Card.Title>
              <h4
                className="mb-0 fw-bold"
                style={{
                  color:
                    selectedCategory === item.title
                      ? "#ffffff"
                      : item.textColor,
                }}
              >
                {item.count}
              </h4>
            </div>
          </Card.Body>
        </Card>
        {/* Active indicator line for desktop */}
        {!isMobileView && selectedCategory === item.title && (
          <div
            style={{
              width: "100%",
              maxWidth: "260px",
              height: "2px",
              backgroundColor: item.textColor,
              marginTop: "5px",
            }}
          />
        )}
      </Col>
    ))}
  </Row>
);

export default CardDisplay;