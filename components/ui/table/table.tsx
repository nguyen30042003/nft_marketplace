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
import { CopyRight, CopyrightType } from "@_types/nft";


interface DataTableProps {
    data: CopyRight[];
    onAccept: (tokenId:number, id: number) => void;
    onPreview: (id: number) => void;
}

export function DataTable({ data, onAccept, onPreview }: DataTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left">Token ID</TableHead>
                        <TableHead className="text-left">Title</TableHead>
                        <TableHead className="text-left">Owner</TableHead>
                        <TableHead className="text-left">Status</TableHead>
                        <TableHead className="text-left">Type</TableHead>
                        <TableHead className="text-left">Update At</TableHead>
                        <TableHead className="text-left">Created At</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="text-left">{item.tokenId}</TableCell>
                            <TableCell className="text-left">{item.metaData.name}</TableCell>
                            <TableCell className="text-left">{item.user.address}</TableCell>
                            <TableCell className="text-left capitalize">{item.status}</TableCell>
                            <TableCell className="text-left capitalize">{item.copyrightType}</TableCell>
                            <TableCell className="text-left">{item.metaData.updateAt?.slice(0, 10)}</TableCell>
                            <TableCell className="text-left">{item.metaData.createAt?.slice(0, 10)}</TableCell>

                            <TableCell className="text-center">
                                {item.status.toLowerCase() === "uploaded" ? (
                                    <Button
                                        variant="default"
                                        onClick={() => onAccept(Number(item.tokenId), Number(item.id))}
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
