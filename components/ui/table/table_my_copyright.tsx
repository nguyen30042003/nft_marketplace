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
    onPreview: (copyright: CopyRight) => void;
}

export function DataTableMyCopyright({ data, onPreview }: DataTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left">Token ID</TableHead>
                        <TableHead className="text-left">Title</TableHead>
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
                            <TableCell className="text-left capitalize">{item.status}</TableCell>
                            <TableCell className="text-left capitalize">{item.copyrightType}</TableCell>
                            <TableCell className="text-left">{item.metaData.updateAt?.slice(0, 10)}</TableCell>
                            <TableCell className="text-left">{item.metaData.createAt?.slice(0, 10)}</TableCell>

                            <TableCell className="text-center">
                                <Button
                                        variant="secondary"
                                        onClick={() => onPreview(item)}
                                        className="w-24"
                                    >
                                        Preview
                                    </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
