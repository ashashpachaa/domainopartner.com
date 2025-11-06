import { useMemo } from "react";
import { mockOrders } from "@/lib/mockData";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function ClientDocuments() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const allDocuments = useMemo(() => {
    const docs: any[] = [];
    mockOrders
      .filter((o) => o.userId === currentUser.id)
      .forEach((order) => {
        if (order.operationFiles) {
          order.operationFiles
            .filter((f) => f.visibleToClient !== false)
            .forEach((file) => {
              docs.push({
                ...file,
                orderId: order.id,
                orderNumber: order.orderNumber,
              });
            });
        }
      });
    return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [currentUser.id]);

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-2">All documents from your orders</p>
        </div>

        {allDocuments.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">No documents yet</p>
            <p className="text-slate-500 text-sm">Documents will appear here as your orders progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allDocuments.map((doc, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-slate-900">{doc.fileName}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Order: {doc.orderNumber}</p>
                    <p className="text-xs text-slate-500">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    {doc.notes && (
                      <p className="text-sm text-slate-600 mt-2 italic">{doc.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = doc.fileUrl || "#";
                      link.download = doc.fileName;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
