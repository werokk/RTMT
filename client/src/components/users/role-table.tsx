import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
  name: string;
  systemOwner: boolean;
  admin: boolean;
  tester: boolean;
  viewer: boolean;
}

interface RoleTableProps {
  permissions: Permission[];
  editable?: boolean;
  onPermissionChange?: (permission: string, role: string, value: boolean) => void;
}

export function RoleTable({ 
  permissions, 
  editable = false,
  onPermissionChange
}: RoleTableProps) {
  return (
    <div className="rounded-md border border-neutral-200 dark:border-neutral-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50 dark:bg-neutral-800">
            <TableHead>Permission</TableHead>
            <TableHead className="text-center">System Owner</TableHead>
            <TableHead className="text-center">Admin</TableHead>
            <TableHead className="text-center">Tester</TableHead>
            <TableHead className="text-center">Viewer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">
                {permission.name}
              </TableCell>
              <TableCell className="text-center">
                {editable && onPermissionChange ? (
                  <Checkbox
                    checked={permission.systemOwner}
                    onCheckedChange={(checked) => 
                      onPermissionChange(permission.name, 'systemOwner', !!checked)
                    }
                    disabled={true} // System Owner always has all permissions
                  />
                ) : permission.systemOwner ? (
                  <span className="text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {editable && onPermissionChange ? (
                  <Checkbox
                    checked={permission.admin}
                    onCheckedChange={(checked) => 
                      onPermissionChange(permission.name, 'admin', !!checked)
                    }
                  />
                ) : permission.admin ? (
                  <span className="text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {editable && onPermissionChange ? (
                  <Checkbox
                    checked={permission.tester}
                    onCheckedChange={(checked) => 
                      onPermissionChange(permission.name, 'tester', !!checked)
                    }
                  />
                ) : permission.tester ? (
                  <span className="text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {editable && onPermissionChange ? (
                  <Checkbox
                    checked={permission.viewer}
                    onCheckedChange={(checked) => 
                      onPermissionChange(permission.name, 'viewer', !!checked)
                    }
                  />
                ) : permission.viewer ? (
                  <span className="text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
