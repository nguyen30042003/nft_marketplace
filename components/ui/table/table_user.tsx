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



interface UserTableProps {
  data: User[];
  onPreview: (user: User) => void;
}

export function DataTableUser({ data, onPreview }: UserTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Username</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Address</TableHead>
            <TableHead className="text-left">Role</TableHead>
            <TableHead className="text-left">Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.address}>
              <TableCell className="text-left">{user.username}</TableCell>
              <TableCell className="text-left">{user.email}</TableCell>
              <TableCell className="text-left">{user.address}</TableCell>
              <TableCell className="text-left">{user.role}</TableCell>
              <TableCell className="text-left">
                {new Date(user.createAt).toLocaleDateString("vi-VN")}
              </TableCell>

              <TableCell className="text-center">
                <Button
                color="primary"
                  
                  onClick={() => onPreview(user)}
                  className=" hover:underline"
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
