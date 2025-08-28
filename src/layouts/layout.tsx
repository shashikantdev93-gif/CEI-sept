import "./globals.css";

import "bootstrap/dist/css/bootstrap.min.css"; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
  rel="stylesheet"
/>


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        
        {children}
        
      </body>
    </html>
  );
}
