"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CopyRight, TransferCopyRightResponse } from "@_types/nft";

interface DataTableProps {
    data: TransferCopyRightResponse[];
    onAccept: (id: number, status: string) => void;
    onPreview: (id: number) => void;
}

const columns = [
    { header: "ID", accessor: "id", className: "text-left" },
    { header: "Title", accessor: "title", className: "text-left" },
    { header: "Owner", accessor: "owner", className: "text-left" },
    { header: "Receiver", accessor: "receiver", className: "text-left" },
    { header: "Proxy Payment", accessor: "proxyPayment", className: "text-left" },
    { header: "Status", accessor: "status", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
];

export function DataTransactionTable({ data, onAccept, onPreview }: DataTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.header} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="text-left">{item.id}</TableCell>
                            <TableCell className="text-left">{item.title}</TableCell>
                            <TableCell className="text-left">{item.fromUserAddress}</TableCell>
                            <TableCell className="text-left">{item.toUserAddress ?? "-"}</TableCell>
                            <TableCell className="text-left">{item.price ?? "-"}</TableCell>
                            <TableCell className="text-left capitalize">{item.status}</TableCell>
                            <TableCell className="text-center">
                                {item.status.toLowerCase() === "uploaded" ? (
                                    <Button
                                        variant="default"
                                        onClick={() => onAccept(Number(item.id), item.status)}
                                        className="w-24"
                                    >
                                        Accept
                                    </Button>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        onClick={() => onPreview(Number(item.id))}
                                        className="w-24"
                                    >
                                        Preview
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
