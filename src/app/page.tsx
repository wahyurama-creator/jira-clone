import {getCurrent} from "@/features/auth/actions";
import {redirect} from "next/navigation";
import {UserButton} from "@/features/auth/components/user-button";

export default async function Home() {
    const user = await getCurrent();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="px-4 py-4">
            <UserButton/>
        </div>
    );
}
