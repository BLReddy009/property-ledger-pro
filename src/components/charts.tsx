"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { expenseBreakdown, monthlyRent, tankerTrend } from "@/lib/report-data";

const colors = ["#126c59", "#e36b5d", "#d89a28", "#3b82f6", "#64748b"];

export function RentCollectionChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={monthlyRent}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e0e3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="collected" stroke="#126c59" fill="#126c59" fillOpacity={0.18} />
          <Area type="monotone" dataKey="pending" stroke="#e36b5d" fill="#e36b5d" fillOpacity={0.18} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpensePieChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={4}>
            {expenseBreakdown.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TankerTrendChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={tankerTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e0e3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="tankers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cost" fill="#d89a28" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
