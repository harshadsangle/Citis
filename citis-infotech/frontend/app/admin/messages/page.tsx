import { Mail, MailOpen } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { messages } from "@/components/admin/mock-data";

type Message = (typeof messages)[number];
const columns: DataTableColumn<Message>[] = [
  { key: "sender", header: "Sender", render: (row) => <div className="flex items-center gap-3">{row.status === "Unread" ? <Mail className="size-4 text-blue-600" /> : <MailOpen className="size-4 text-muted-foreground" />}<div><p className={row.status === "Unread" ? "font-semibold" : "font-medium"}>{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></div></div> },
  { key: "message", header: "Message", className: "max-w-xl", render: (row) => <div><p className={row.status === "Unread" ? "font-semibold" : "font-medium"}>{row.subject}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{row.preview}</p></div> },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "time", header: "Received", render: (row) => <span className="whitespace-nowrap text-muted-foreground">{row.time}</span> },
  { key: "actions", header: "", className: "w-12", render: (row) => <RowActions label={row.subject} /> },
];

export default function MessagesPage() {
  return <div className="mx-auto max-w-[1600px]"><AdminPageTitle title="Messages" description="Review and respond to enquiries from the website." actionLabel="Compose" /><TableToolbar placeholder="Search messages…" filters={["All messages"]} /><DataTable columns={columns} data={messages} getRowKey={(row) => row.id} emptyTitle="Inbox zero" emptyDescription="You have no new contact messages." /></div>;
}
