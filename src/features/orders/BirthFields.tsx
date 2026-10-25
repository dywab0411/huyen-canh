import { useState } from "react";
import { dateFromDisplay, maskDate, maskTime } from "./birth-format";
export function BirthFields({ second = false }: { second?: boolean }) {
  const [unknown, setUnknown] = useState(false),
    [date, setDate] = useState(""),
    [time, setTime] = useState("");
  const suffix = second ? "2" : "",
    person = second ? "người thứ hai" : "người thứ nhất";
  return (
    <div className="birth-fields">
      <label>
        Ngày tháng năm sinh {person}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
          placeholder="DD/MM/YYYY"
          maxLength={10}
          value={date}
          onChange={(e) => setDate(maskDate(e.target.value))}
        />
      </label>
      <input
        type="hidden"
        name={"birth_date" + suffix}
        value={dateFromDisplay(date)}
      />
      <label>
        Giờ sinh {person} (HH:mm, tùy chọn)
        <span className="birth-clock">
          <span aria-hidden="true">◷</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            name={"birth_hour" + suffix}
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            placeholder="00:00"
            maxLength={5}
            value={time}
            disabled={unknown}
            onChange={(e) => setTime(maskTime(e.target.value))}
          />
        </span>
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={unknown}
          onChange={(e) => {
            setUnknown(e.target.checked);
            if (e.target.checked) setTime("");
          }}
        />
        Không rõ giờ sinh {person}
      </label>
    </div>
  );
}
