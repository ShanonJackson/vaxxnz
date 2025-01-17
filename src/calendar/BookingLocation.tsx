/* eslint-disable react/jsx-no-target-blank */
import { Button, KIND } from "baseui/button";
import { isAfter, isToday, parse } from "date-fns";
import { differenceInDays } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { enqueueAnalyticsEvent } from "../utils/analytics";
import { formatToLocaleTimeString } from "../utils/date";
import { getDistanceKm } from "../utils/distance";
import { formatDistanceKm } from "../utils/locale";
import { useCoords } from "../utils/useCoords";
import { useRadiusKm } from "../utils/useRadiusKm";
import { useSeen } from "../utils/useSeen";
import {
    BookingLocationSlotsPair,
    SlotWithAvailability,
} from "./booking/BookingDataTypes";
import { CalendarDate } from "./CalendarData";
import styles from "./BookingLocation.module.scss";

type BookingLocationProps = {
    locationSlotsPair: BookingLocationSlotsPair;
    activeDate: CalendarDate;
};

const filterOldSlots = (
    slots: SlotWithAvailability[],
    isTodayDate: boolean
) => {
    if (isTodayDate) {
        return slots.filter(({ localStartTime }) => {
            const startTime = parse(localStartTime, "HH:mm:ss", new Date());
            return isAfter(startTime, new Date());
        });
    }
    return slots;
};

const BookingLocation = ({
    locationSlotsPair,
    activeDate,
}: BookingLocationProps) => {
    const { t, i18n } = useTranslation("common");
    const ref = useRef() as any;
    const seen = useSeen(ref, "20px");
    const [slots, setSlots] = useState<SlotWithAvailability[] | undefined>();
    const radiusKm = useRadiusKm();
    const coords = useCoords();

    const getSlots = async (url: string) => {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vaccineData: "WyJhMVQ0YTAwMDAwMEhJS0NFQTQiXQ==",
                    groupSize: 1,
                    url: "https://app.bookmyvaccine.covid19.health.nz/appointment-select",
                    timeZone: "Pacific/Auckland",
                }),
            });
            const dataStr = await res.text();
            let data;

            data = JSON.parse(dataStr);
            return data;
        } catch (e) {
            console.log("Couldn't retreive slots");
            return;
        }
    };

    useEffect(() => {
        const IS_UAT =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname.endsWith("netlify.app");

        const MOH_PROXY = IS_UAT
            ? "https://dev-moh-f3a4edb2.vaxx.nz"
            : "https://moh.vaxx.nz";
        async function load() {
            if (!seen || slots) {
                return;
            }
            const response = await getSlots(
                `${MOH_PROXY}/public/locations/${locationSlotsPair.location.extId}/date/${activeDate.dateStr}/slots`
            );
            if (response) {
                setSlots(response.slotsWithAvailability);
            }
        }
        load();
    }, [
        seen,
        slots,
        setSlots,
        locationSlotsPair.location.extId,
        activeDate.dateStr,
    ]);

    const isTodayDate = activeDate?.dateStr
        ? isToday(new Date(activeDate.dateStr))
        : false;

    const slotsToDisplay =
        slots && slots.length > 0
            ? filterOldSlots(slots, isTodayDate)
            : filterOldSlots(locationSlotsPair.slots ?? [], isTodayDate);

    const location = locationSlotsPair.location;
    const date = parse(activeDate.dateStr, "yyyy-MM-dd", new Date());
    if (slotsToDisplay.length === 0) {
        return null;
    } else {
        return (
            <section className={styles["vaccine-center"]} ref={ref}>
                <h3>{location.name}</h3>
                <p>
                    {location.displayAddress} (
                    {t("core.distanceAway", {
                        distance: formatDistanceKm(
                            getDistanceKm(coords, location.location),
                            i18n.language
                        ),
                    })}
                    )
                </p>
                <p>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.location.lat},${location.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                            enqueueAnalyticsEvent("Get Directions clicked", {
                                radiusKm,
                                spotsAvailable: slots?.length || 0,
                                bookingDateInDays: differenceInDays(
                                    date,
                                    new Date()
                                ),
                            })
                        }
                    >
                        {t("core.getDirections")}
                    </a>
                </p>
                <div className={styles["button-constraint"]}>
                    <a
                        href={`https://app.bookmyvaccine.covid19.health.nz/deep-linking?location=${locationSlotsPair.location.extId}&date=${activeDate.dateStr}`}
                        target="_blank"
                        referrerPolicy="origin"
                        rel="noreferrer"
                    >
                        <Button
                            overrides={{
                                Root: {
                                    style: {
                                        width: "100%",
                                    },
                                },
                            }}
                            onClick={() =>
                                enqueueAnalyticsEvent(
                                    "Make a Booking clicked",
                                    {
                                        locationName: location.name,
                                        radiusKm,
                                        spotsAvailable: slots?.length || 0,
                                        bookingDateInDays: differenceInDays(
                                            date,
                                            new Date()
                                        ),
                                    }
                                )
                            }
                        >
                            {t("core.makeABooking")}
                        </Button>
                    </a>
                    <a
                        href={`https://app.bookmyvaccine.covid19.health.nz/manage`}
                        target="_blank"
                        referrerPolicy="origin"
                        rel="noreferrer"
                    >
                        <Button
                            kind={KIND.secondary}
                            overrides={{
                                Root: {
                                    style: {
                                        width: "100%",
                                    },
                                },
                            }}
                            onClick={() =>
                                enqueueAnalyticsEvent("Edit Booking clicked", {
                                    locationName: location.name,
                                    radiusKm,
                                    spotsAvailable: slots?.length || 0,
                                    bookingDateInDays: differenceInDays(
                                        date,
                                        new Date()
                                    ),
                                })
                            }
                        >
                            {t("core.changeOrCancelABooking")}
                        </Button>
                    </a>
                </div>
                <p
                    style={{
                        marginTop: "0.25rem",
                        marginRight: 0,
                        marginBottom: "0.5rem",
                        marginLeft: 0,
                    }}
                >
                    {t("calendar.modal.availableSlots")}
                </p>
                <section className={styles.slot}>
                    {/* <p>1am</p> */}
                    {slotsToDisplay?.map((slot) => (
                        <p key={slot.localStartTime}>
                            {formatToLocaleTimeString(
                                slot.localStartTime,
                                i18n.language
                            )}
                        </p>
                    ))}
                </section>
            </section>
        );
    }
};

export default BookingLocation;
