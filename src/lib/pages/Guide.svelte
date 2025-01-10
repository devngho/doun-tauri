<script>
    import { get } from "svelte/store";
    import Dropdown from "../components/Dropdown.svelte";
    import { DayOfWeek } from "../daytime";
    import { schedules } from "../store";
    import { fadeSlide } from "../transition";
    import { Schedules } from "../schedule";
    import { redirect } from "../page";
    import { contextDropdown } from "../dropdown";
</script>

<article class="p-8 pt-24 w-screen" id={$$props._page}>
    <div class="flex flex-col justify-center items-center w-screen">
        <h1 class="text-4xl">타종기</h1>
        <span class="text-xl">v1.0.6</span>
    </div>

    <h2>기본 조작</h2>
    <ul>
        <li>
            상단 바의 버튼으로 탭을 이동하거나 정보를 확인할 수 있습니다. 다른
            탭에서는 오른쪽 아래 홈 화면 버튼을 누르거나, 뒤로 가기를 사용할 수
            있습니다.
        </li>
        <li>
            템플릿 탭에서 템플릿을 추가, 편집할 수 있습니다. 템플릿을 우클릭하면
            메뉴를 열 수 있습니다.
        </li>
        <li>
            템플릿 편집을 선택하면 템플릿의 자동 실행 옵션, 이름 등을 바꾸거나
            일반 / 가져오기 / 대기의 스케줄을 추가할 수 있습니다. 우클릭해
            메뉴를 열 수 있습니다. 오른쪽 햄버거 모양 버튼을 잡고 끌어 순서를
            바꿀 수 있습니다.
        </li>
        <li>
            볼륨 탭에서 각 음성 파일이 재생될 때의 음량을 조절할 수 있습니다.
        </li>
        <li>
            설정 탭에서는 테마를 바꾸거나, 템플릿을 가져오거나, 백업을 하는 등
            다양한 설정을 할 수 있습니다.
        </li>
        <li>저장하기 버튼은 현재 설정과 템플릿을 저장합니다.</li>
        <li>
            새로고침 버튼은 현재 템플릿으로 다시 변경하고, 변경을 반영합니다.
            예를 들어, 미루기한 일정이 다시 원래 상태로 돌아옵니다. 또한
            가져오기한 템플릿이 변경된 경우, 변경된 템플릿으로 다시 가져옵니다.
        </li>
        <li>
            미루기 버튼은 현재 템플릿을 변경하지 않고, 다음 일정을 설정한
            시간만큼 미룰 수 있습니다.
        </li>
    </ul>
    <h2>기본 개념</h2>
    <h3>스케줄</h3>
    스케줄이란, 대기 / 가져오기 / 일반과 같이, 종소리를 재생하거나 일정 시간만큼
    기다리는 일정을 말합니다. 예를 들면:
    <div
        class="w-100 bg-white shadow-md dark:bg-gray-700 p-4 my-2 rounded-md flex"
        in:fadeSlide
        use:contextDropdown
    >
        <h2 class="text-2xl flex flex-row items-center mr-2">
            일반 예시
            <h3 class="text-xl mx-1 text-gray-500 dark:text-gray-300">
                예시.mp3
            </h3>
        </h2>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    <div
        class="w-100 bg-gray-300 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-4 my-2 rounded-md shadow-sm flex flex-row items-center"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl mr-2">대기: 대기 예시 00:00:00</span>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    <div
        class="w-100 bg-white dark:bg-gray-700 p-4 my-2 rounded-md shadow-md flex"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl mr-2">가져오기 예시(예시 스케줄)</span>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    <ul>
        <li>일반: 소리 파일을 설정해 소리를 재생합니다.</li>
        <li>대기: 특정 시간만큼 기다려 다음 일정까지의 간격을 만듭니다.</li>
        <li>
            가져오기: 다른 템플릿을 가져와 넣습니다. 예를 들면, 6교시 템플릿은
            1교시 템플릿을 '가져오기'해서 사용합니다.
        </li>
    </ul>
    <h3>템플릿</h3>
    템플릿은 여러 스케줄들을 모아놓은 것입니다. 위의 템플릿 탭에서 템플릿을 구경하고
    와도 좋겠네요.
    <div
        class="flex flex-row bg-white dark:bg-gray-700 items-center w-100 shadow-md p-4 my-2 rounded-md transition-all"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl flex flex-row items-center">
            예시 템플릿
            <span class="text-xl mx-1 text-gray-500 dark:text-gray-300">
                총 길이 00:00:00
            </span>
        </span>
        <div class="mr-2" />
        <Dropdown
            ><button>삭제</button>
            <button>복제</button>
            <button>편집</button>
            <button>사용</button></Dropdown
        >
    </div>
    <ul>
        <li>
            삭제: 템플릿을 삭제합니다. <strong
                >되돌릴 수 없으니 주의하세요!</strong
            >
        </li>
        <li>복제: 이 템플릿을 복제합니다. 가장 아래에 복제됩니다.</li>
        <li>편집: 편집 페이지로 이동합니다.</li>
        <li>사용: 이 템플릿을 사용합니다.</li>
    </ul>
    <h2>실전</h2>
    <h3>템플릿 만들기</h3>
    <!-- svelte-ignore a11y-invalid-attribute -->
    <p class="mt-4 mb-4">
        <button>이름</button>
        <button>요일</button>
        <button>시간표</button>
        <button>특정일</button>
    </p>
    <p class="mb-4">
        <!-- svelte-ignore a11y-invalid-attribute -->
        <input
            type="string"
            class="mr-1 bg-gray-100 dark:bg-gray-900 rounded px-2 flex-grow"
            placeholder="새 템플릿 이름"
        />
        <select class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-2">
            {#each Object.keys(DayOfWeek) as i}
                <option value={i}>{i}</option>
            {/each}
        </select>
        <input
            type="number"
            class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-1"
        />
        교시
        <input
            type="number"
            class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-1"
        />
        분
        <input
            type="date"
            class="flex-grow bg-gray-100 dark:bg-gray-900 rounded px-2"
        />
    </p>
    이 버튼들은 템플릿을 만들면 맨 위에 나오는 것으로, 자동으로 템플릿을 선택하고
    템플릿을 구분하기 위해 설정해야 합니다. 이 프로그램에는 시간표나 요일을 받아와
    오늘의 템플릿 자동으로 선택하는 기능이 있습니다. 이를 사용하려면 요일이나 시간표,
    특정 날짜를 선택해야 합니다. 참고로, 시간표는 인터넷 연결이 필요하며, 일반적이지
    않은 상황에서는 제대로 작동하지 않을 수 있습니다(예: 행복 나눔의 날, 시험, 매
    교시가 일정한 길이가 아닌 경우 등)
    <br />
    <button
        on:click={() => {
            schedules.update((v) => {
                const id = "example";
                v[id] = new Schedules({
                    name: "템플릿 실습 - 저장되지 않음",
                    schedules: [],
                });
                redirect(`/template/${id}`);
                return v;
            });
        }}>실습하기</button
    >
    <h3>에러</h3>
    일정에 에러가 발생했나요? 그럴 경우, 그룹 기능의 사용에 문제가 있는지 봐야 합니다.
    메인 화면의 '풀어서 보기'를 선택했을 때, '스케줄이 순환함' 문제가 발생한다면
    다음을 참고하세요. 다음 상황과 같이<strong
        >A의 1번째 스케줄 일정, B 스케줄을 포함</strong
    >과 같은 에러 메시지가 나왔다면, A라는 템플릿의 1번째 스케줄인 '새 일정'이
    B라는 템플릿을 포함하는데, B가 A를 포함하고 있어 순환하는 것입니다. 즉, 서로
    가져오고 있는 상황인 것입니다. 마치 "가위를 샀는데 포장을 열기 위해 가위가
    필요하다"같은 상황이죠.
    <h4 class="text-lg mt-2">A 템플릿</h4>
    <div
        class="w-100 bg-white dark:bg-gray-700 p-4 my-2 rounded-md shadow-md flex"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl mr-2">가져오기(B 템플릿)</span>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    <h4 class="text-lg mt-2">B 템플릿</h4>
    <div
        class="w-100 bg-white dark:bg-gray-700 p-4 my-2 rounded-md shadow-md flex"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl mr-2">가져오기(A 템플릿)</span>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    <h4 class="text-lg mt-2">'풀어서 보기' 화면</h4>
    <div
        class="w-100 bg-red-300 dark:bg-red-700 p-4 rounded-md shadow-md mb-2"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl">
            스케줄이 순환함(A의 1번째 스케줄 일정, B 스케줄을 포함)
        </span>
        <h3 class="text-xl">00:00:00</h3>
    </div>
    해결법은 간단합니다. A 템플릿이 B 템플릿을 포함하지 않도록 하거나, B 템플릿이
    A 템플릿을 포함하지 않도록 하면 됩니다.
    <h3>미루기</h3>
    화면 위쪽의 '미루기' 버튼을 누르면, 실제 템플릿을 변경하지 않으면서, 다음 스케줄을
    설정한 시간만큼 미룰 수 있습니다.<strong
        >뒤의 모든 스케줄을 미루지 않습니다!</strong
    >
    설정 탭에서 미루기 시간을 설정할 수 있습니다. 음수로도 설정할 수 있습니다. 옆의
    새로고침을 누르면 미룬 스케줄이 다시 돌아옵니다.

    <h2>심화</h2>
    <h3>시간 다루기</h3>
    여러분이 '1교시(45분)' 등의 템플릿을 살펴보았다면, 뭔가 이상한 것을 보았을 겁니다.
    다음처럼요:
    <div
        class="w-100 bg-gray-300 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-4 my-2 rounded-md shadow-sm flex flex-row items-center"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl mr-2">대기: 대기 예시 23:58:00</span>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    <div
        class="w-100 bg-white shadow-md dark:bg-gray-700 p-4 my-2 rounded-md flex"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl flex flex-row items-center mr-2">
            일반 예시
            <span class="text-xl mx-1 text-gray-500 dark:text-gray-300"
                >2분전.mp3</span
            >
        </span>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    <div
        class="w-100 bg-gray-300 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-4 my-2 rounded-md shadow-sm flex flex-row items-center"
        in:fadeSlide
        use:contextDropdown
    >
        <span class="text-2xl mr-2">대기: 대기 예시 00:02:00</span>
        <Dropdown>메뉴가 표시됩니다</Dropdown>
    </div>
    도대체 이게 무슨 의미일까요? 이는 직접 템플릿을 만들고 대기에 -2분을 설정해보면
    쉽게 알 수 있습니다. 템플릿은 하루, 즉 24시간을 기준으로 하기 때문에, 24시간을
    넘어가는 시간은 다시 00:00:00부터 시작합니다. 따라서, 23:58:00은 2분 전으로 돌아가는
    효과를 낼 수 있는 것이죠. 예를 들어, 08:00:00에 23:58:00 대기를 설정하면, 31:58:00이지만
    24시간을 넘으니 07:58:00으로, 2분 전으로 돌아가 소리를 내는 효과를 낼 수 있는
    것입니다
    <h3>어떻게 작동하는가</h3>
    일반과 대기, 그룹을 기반으로 한 스케줄은 작성하기에 직관적입니다. 하지만 이 상태로는
    실제로 프로그램이 종을 울리기에 어려움이 있습니다. 따라서, 템플릿은 다음과 같이
    변환되어 실행됩니다:
    <ol>
        <li>묶여진 그룹을 풉니다.</li>
        <li>
            '대기'를 포함한 모든 일정에 실제 시간을 계산합니다.
            <ol>
                <li>00:00:00부터 시작합니다.</li>
                <li>'대기'가 있다면 계산중인 현재 시간에 더합니다.</li>
            </ol>
        </li>
    </ol>
    이 과정을 거친 것이 '풀어서 보기'에서 볼 수 있는 것입니다. '풀어서 보기' 화면에는
    모든 일정에 실제 시간이 있고, 묶여진 그룹은 풀어져 있습니다.
    <h3>호환 오디오 코덱과 컨테이너</h3>
    이 프로그램은<a href="https://github.com/RustAudio/rodio">Rodio</a>
    라이브러리가 지원하는 대부분의 오디오 코덱과 컨테이너를 지원합니다. 이 프로그램은
    MP3, WAV, Vorbis, FLAC를 지원합니다.
</article>

<style lang="postcss">
    ul {
        list-style: disc;
        margin-left: 2rem;
    }
    ol {
        list-style: decimal;
        margin-left: 2rem;
        margin-top: 0.25rem;
    }
    h2 {
        @apply text-3xl mt-4 mb-2;
    }
    h3 {
        @apply text-xl mt-2 mb-1;
    }
    li {
        @apply mb-2;
    }
</style>
