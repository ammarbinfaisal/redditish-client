import { useContext, useState } from "react";
import useSWR from "swr";
import { fetcher, usePost } from "@/hooks/useApi";
import { useRouter } from "next/router";
import { MsgDispatchContext } from "@/context/message";
import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Auth from "@/components/Auth";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

const NewPost = () => {
    const post = usePost();
    const router = useRouter();
    const community = router.query.community;
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [community_id, setCommunityId] = useState<string | null>(
        community?.toString() || null
    );
    const { data: joined } = useSWR("c/joined", fetcher(1000 * 60 * 5));
    const msgDispatch = useContext(MsgDispatchContext);

    const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!community_id) {
            msgDispatch("please select a community");
        }
        try {
            const res = await post("p/create", {
                title,
                content,
                community_id,
            });
            console.log(res);
            router.push(`/p/${res.data.id}`);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Auth>
            <Main>
                <Navbar />
                {joined?.length ? (
                    <form
                        className="flex flex-col max-w-3xl w-full mx-auto"
                        onSubmit={createPost}
                    >
                        <input
                            placeholder="title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="py-2 px-4 my-2"
                        />
                        <Editor
                            content={content}
                            setContent={setContent}
                        />
                        <div className="grid grid-cols-4 gap-2 my-2">
                            <label htmlFor="communityId" className="col-span-1">
                                communityId
                            </label>
                            <select
                                name="communityId"
                                onChange={(e) => setCommunityId(e.target.value)}
                                className="col-span-3"
                                value={community_id ? community_id : ""}
                            >
                                <option value={""}>select a community</option>
                                {joined.map((c: any) => (
                                    <option key={c.name} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button type="submit">create</Button>
                    </form>
                ) : (
                    <div className="flex flex-col justify-center items-center max-w-3xl w-full mx-auto">
                        <p className="text-2xl">
                            you are not in any communities
                        </p>
                        <p className="text-xl">
                            join a communityId to create a post
                        </p>
                    </div>
                )}
            </Main>
        </Auth>
    );
};

export default NewPost;
