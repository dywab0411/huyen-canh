import { dateForDisplay, timeForDisplay } from "../orders/birth-format";
import { useEffect, useState } from "react";
import { api } from "../../lib/auth";
type Detail = {
  name: string;
  gender: string | null;
  birth_date: string | null;
  birth_hour: string | null;
  name2: string | null;
  gender2: string | null;
  birth_date2: string | null;
  birth_hour2: string | null;
};
export function OrderBirthDetails({ orderId }: { orderId: string }) {
  const [data, setData] = useState<Detail | null>(null),
    [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    void api("admin/order-details", { order_id: orderId })
      .then((r) => {
        if (active) setData(r.details as Detail);
      })
      .catch(() => {
        if (active) setMessage("Chưa tải được thông tin riêng của đơn.");
      });
    return () => {
      active = false;
    };
  }, [orderId]);
  return (
    <aside className="panel">
      <h3>Thông tin sinh · chỉ dành cho quản trị đã xác minh</h3>
      {data ? (
        <>
          <p>
            {data.name} · {data.gender ?? "Chưa có"}
          </p>
          <p>
            Ngày sinh: {dateForDisplay(data.birth_date)} · Giờ sinh:{" "}
            {timeForDisplay(data.birth_hour)}
          </p>
          {data.name2 && (
            <>
              <p>
                {data.name2} · {data.gender2}
              </p>
              <p>
                Ngày sinh: {dateForDisplay(data.birth_date2)} · Giờ sinh:{" "}
                {timeForDisplay(data.birth_hour2)}
              </p>
            </>
          )}
        </>
      ) : (
        <p>{message || "Đang tải thông tin riêng…"}</p>
      )}
    </aside>
  );
}
