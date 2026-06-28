import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProjects } from '../store/projects-slice';
import { ProjectCard } from '../components/project-card';
import { CreateProjectModal } from '../components/create-project-modal';

const GRID_CLASSES = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';

const SkeletonGrid = () => (
  <div className={GRID_CLASSES}>
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
        <div className="h-5 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded mt-3" />
        <div className="h-4 w-1/3 bg-gray-100 rounded mt-3" />
      </div>
    ))}
  </div>
);

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.projects);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Fetch once on mount; the slice marks status so we don't refetch on every
    // render. (createProject prepends into the same list, no reload needed.)
    if (status === 'idle') {
      void dispatch(fetchProjects());
    }
  }, [status, dispatch]);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl text-gray-900 font-semibold">Your projects</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 whitespace-nowrap"
        >
          New project
        </button>
      </div>

      {isLoading ? <SkeletonGrid /> : null}

      {status === 'failed' ? (
        <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">
          {error ?? 'Something went wrong while loading your projects.'}
        </div>
      ) : null}

      {status === 'succeeded' && items.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center space-y-4">
          <p className="text-gray-600">You don&apos;t have any projects yet.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
          >
            Create your first project
          </button>
        </div>
      ) : null}

      {status === 'succeeded' && items.length > 0 ? (
        <div className={GRID_CLASSES}>
          {items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : null}

      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
