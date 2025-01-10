<script lang="ts">
    import {
        DelaySchedule,
        GroupSchedule,
        Schedules,
        SingleSchedule,
    } from "../../schedule";
    import { schedules } from "../../store";
    import { redirect } from "../../page";
</script>

<article id={$$props._page}>
    <div class="w-screen h-screen flex flex-col p-8">
        <h1 class="text-5xl flex mb-6">예시 템플릿으로 시작할게요</h1>
        <p class="text-lg break-keep">
            템플릿 설명이 있는 예시 템플릿으로 시작할게요. 오른쪽 아래 '홈으로'
            버튼과 위쪽 버튼을 둘러보세요. 정확한 기능이나 사용법을 알고 싶다면
            나중에 가이드를 참고하세요.
        </p>
        <p class="text-lg text-gray-500">'정보' 탭에서 볼 수 있어요</p>
        <div class="flex-grow" />
        <div class="flex flex-row">
            <div class="flex-grow" />
            <button
                class="text-2xl w-48"
                on:click={() => {
                    schedules.update((v) => {
                        const id = "example";
                        v[id] = new Schedules({
                            name: "첫 템플릿",
                            schedules: [
                                new SingleSchedule(
                                    "위에서 이름을 바꾸거나 자동 템플릿 찾기의 조건을 설정할 수 있어요",
                                    " ",
                                ),
                                new SingleSchedule(
                                    "'일반', '대기', '가져오기' 일정을 화면 아래에서 추가할 수 있어요",
                                    " ",
                                ),
                                new SingleSchedule(
                                    "'일반' 일정은 해당 시간이 되면 소리를 내요",
                                    " ",
                                ),
                                new SingleSchedule(
                                    "wav, mp3 등 소리 파일을 오른쪽 버튼으로 선택하세요",
                                    "선택하기",
                                ),
                                new DelaySchedule(
                                    "'대기' 일정으로 두 일정 사이에 간격을 두세요",
                                    10,
                                ),
                                new GroupSchedule(
                                    "'가져오기'를 통해서 다른 템플릿을 가져와 넣어요",
                                    "",
                                ),
                                new SingleSchedule(
                                    "일정을 끌어당겨서 순서를 바꿀 수 있어요",
                                    "직접 시도해보세요",
                                ),
                                new SingleSchedule(
                                    "일정을 우클릭해서 복제, 삭제할 수 있어요",
                                    " ",
                                ),
                            ],
                        });
                        redirect(`/template/${id}`);
                        return v;
                    });
                }}>좋아요</button
            >
        </div>
    </div>
</article>
