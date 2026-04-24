import { parseTripData } from "~/lib/utils";
import { appwriteConfig, tablesDB } from "./client";

interface Document {
    [key: string]: any;
}

type FilterByDate = (
    items: Document[],
    key: string,
    start: string,
    end?: string
) => number;

export const getUsersAndTripsStats = async (): Promise<DashboardStats> => {
    const d = new Date();
    const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const startPrev = new Date(d.getFullYear(), d.getMonth() -1, 1).toISOString();
    const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();

    const [users, trips] = await Promise.all([
        tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId
        }),
        tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.tripTableId
        }),
    ])

    const filterByDate: FilterByDate = (items, key, start, end) => items.filter((item) => (
        item[key] >= start && (!end || item[key] <= end)
    )).length;

    const filterUsersByRole = (role: string) => {
        return users.rows.filter((u: Document) => u.status === role)
    }

    return {
        totalUsers: users.total,
        usersJoined: {
            currentMonth: filterByDate(users.rows, 'joinedAt', startCurrent, undefined),
            lastMonth: filterByDate(users.rows,'joinedAt',startPrev,endPrev)
        },
        userRole: {
            total: filterUsersByRole('user').length,
            currentMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startPrev,
                endPrev
            )
        },
        totalTrips: trips.total,
        tripsCreated: {
            currentMonth: filterByDate(
                trips.rows,
                'createdAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startPrev,
                endPrev
            )
        },
    }
}

export const getUserGrowthPerDay = async () => {
    const users = await tablesDB.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.userTableId
    });

    const userGrowth = users.rows.reduce(
        (acc: { [key: string]: number }, user: Document) => {
            const date = new Date(user.joinedAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(userGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getTripsCreatedPerDay = async () => {
    const trips = await tablesDB.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripTableId
    });

    const tripsGrowth = trips.rows.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const date = new Date(trip.createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(tripsGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getTripsByTravelStyle = async () => {
    const trips = await tablesDB.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripTableId
    });

    const travelStyleCounts = trips.rows.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const tripDetail = parseTripData(trip.tripDetail);

            if (tripDetail && tripDetail.travelStyle) {
                const travelStyle = tripDetail.travelStyle;
                acc[travelStyle] = (acc[travelStyle] || 0) + 1;
            }
            return acc;
        },
        {}
    );

    return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
        count: Number(count),
        travelStyle,
    }));
};