import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

type TableSkeletonProps = {
  columns?: number;
  rows?: number;
};

export const TableSkeleton = ({ columns = 6, rows = 8 }: TableSkeletonProps) => (
  <Box sx={{ p: 1.5, width: "100%" }}>
    <Stack spacing={1}>
      <Skeleton height={36} variant="rounded" />
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height={34} variant="rounded" />
        ))}
      </Box>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={`row-${rowIndex}`}
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${columnIndex}`}
              height={30}
              variant="rounded"
            />
          ))}
        </Box>
      ))}
    </Stack>
  </Box>
);

export default TableSkeleton;
