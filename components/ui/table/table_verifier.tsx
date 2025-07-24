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
import { User } from "components/fectData/fetch_user";

interface VerifierTableProps {
  data: User[];
  onPreview: (user: User) => void;
}

export function DataTableVerifier({ data, onPreview }: VerifierTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Verifier Name</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Address</TableHead>
            <TableHead className="text-left">Role</TableHead>
            <TableHead className="text-left">Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((verifier) => (
            <TableRow key={verifier.address}>
              <TableCell className="text-left">{verifier.username}</TableCell>
              <TableCell className="text-left">{verifier.email}</TableCell>
              <TableCell className="text-left">{verifier.address}</TableCell>
              <TableCell className="text-left">{verifier.role}</TableCell>
              <TableCell className="text-left">
                {new Date(verifier.createAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell className="text-center">
                <Button onClick={() => onPreview(verifier)} className="hover:underline">
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
