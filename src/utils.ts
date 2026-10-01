export function generateIcsFile(weddingData: any) {
  const startDate = new Date(weddingData.weddingDate);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//EN
BEGIN:VEVENT
UID:${startDate.getTime()}@wedding.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Wedding of ${weddingData.groom.name} & ${weddingData.bride.name}
LOCATION:${weddingData.venue.name}, ${weddingData.venue.addressLine1}
DESCRIPTION:Join us to celebrate the wedding of ${weddingData.groom.name} & ${weddingData.bride.name}.
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "wedding-invitation.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
